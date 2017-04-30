
var Emitter = require("../emitter.js");
var Connection = require("./connection.js");
var Distribute = require("./distribute.js");
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
  // splitter/auth/alias
  // splitter/wait/key
  // splitter/pull/key
  // splitter/emit/key
  interface.request = function (req, res) {
    var parts = /^\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(Url.parse(req.url).path);
    if (!parts || parts[1] !== options.splitter)
      return false;
    res = options.debug ? Debug.request(req, res) : res;
    if (parts[2] === "auth") {
      var alias = fresh(connections, parts[3]);
      var key = (options.debug?alias+"-":"")+Crypto.randomBytes(32).toString("base64").replace(/[^A-Za-z0-9]/g, "");
      aliases[key] = alias;
      connections[alias] = Connection(Distribute(connections, alias));
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
      res.end("key-not-found");
    }
    return true;
  };
  // /splitter/key
  interface.socket = function (socket) {
    var parts = /^\/([^/]+)\/([^/]+)$/.exec(Url.parse(socket.upgradeReq.url).path);
    if (!parts || parts[1] !== options.splitter)
      return false;
    socket = options.debug ? Debug.socket(socket) : socket;
    if (parts[2] in aliases) {
      interface.emit("connect", aliases[parts[2]]);
      socket.on("close", function (code, reason) {
        interface.emit("disconnect", aliases[parts[2]]);
        delete connections[aliases[parts[2]]];
        delete aliases[parts[2]];
      });
      connections[aliases[parts[2]]].onsocket(socket);
    } else {
      socket.close(4000, "key-not-found");
    }
    return true;
  }
  options.format = options.format || JSON;
  var emitters = {};
  emitters["$"] = Emitter(options.format, Distribute(connections, options.alias).bind(null, "$"));
  emitters["@"] = Emitter(options.format, Distribute(connections, options.alias).bind(null, "@"));
  connections.melf = {
    receive: function (channel, origin, event) {
      emitters[channel].receive(origin, event);
    }
  };
  interface.melf = {
    alias: options.alias,
    sync: {
      register: emitters["$"].register,
      unregister: emitters["$"].register,
      emit: emitters["$"].emit
    },
    async: {
      register: emitters["@"].register,
      unregister: emitters["@"].register,
      emit: emitters["@"].emit
    }
  };
  return interface;
};
