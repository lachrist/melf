
var Emitter = require("../emitter.js");
var Connection = require("./connection.js");
var Send = require("./send.js");
var Crypto = require("crypto");
var Debug = require("./debug.js");
var EventEmitter = require("events");
var Url = require("url");

function fresh (object, key) {
  if (!(key in object))
    return key;
  var counter = 0
  while (key+counter in object)
    counter++;
  return key+counter;
}

module.exports = function (options) {
  options = typeof options === "string" ? {splitter:options} : options;
  var aliases = {};
  var connections = {};
  var interface = new EventEmitter();
  // /key/wait
  // /key/pull/
  interface.onrequest = function (req, res) {
    var parts = /^\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(Url.parse(req.url).path);
    if (!parts || parts[1] !== options.splitter)
      return false;
    res = options.debug ? Debug.request(req, res) : res;
    if (parts[2] === "auth") {
      var alias = fresh(connections, parts[3]);
      var key = (options.debug?alias+"-":"")+Crypto.randomBytes(32).toString("base64").replace(/[^A-Za-z0-9]/g, "");
      aliases[key] = alias;
      connections[alias] = Connection(Send(connections, alias));
      interface.emit("authentify", alias);
      res.end(alias+"/"+key);
    } else if (parts[3] in aliases) {
      if (req.method === "GET") {
        connections[aliases[parts[3]]].onrequest(parts[2], null, res);
      } else {
        var body = "";
        req.on("data", function (data) { body += data });
        req.on("end", function () {
          connections[aliases[parts[3]]].onrequest(parts[2], body, res);
        });
      }
    } else {
      res.writeHead(400);
      res.end("key-not-found "+parts[3]);
    }
    return true;
  };
  // /splitter/key
  interface.onconnect = function (con) {
    var parts = /^\/([^/]+)\/([^/]+)$/.exec(Url.parse(con.upgradeReq.url).path);
    if (!parts || parts[1] !== options.splitter)
      return false;
    con = options.debug ? Debug.socket(con) : con;
    if (parts[2] in aliases) {
      interface.emit("connect", aliases[parts[2]]);
      socket.on("close", function (code, reason) {
        interface.emit("disconnect", aliases[parts[2]], code, reason);
        delete connections[aliases[parts[2]]];
        delete aliases[parts[2]];
      });
      connections[aliases[parts[2]]].onsocket(socket);
    } else {
      con.close(4000, "key-not-found");
    }
    return true;
  }
  options.alias = options.alias || "melf";
  var emitter = Emitter(options.format || JSON, Send(connections, options.alias));
  connections[options.alias] = {receive:emitter.receive};
  interface.melf = {
    alias: "melf",
    on: emitter.on,
    emit: emitter.emit
  };
  return interface;
};
