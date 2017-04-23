
var Emitter = require("../emitter.js");
var Connection = require("./connection.js");
var Distribute = require("./distribute.js");
var Crypto = require("crypto");

function fresh (object, key) {
  if (!(key in object))
    return key;
  var counter = 0
  while (key+counter in object)
    counter++;
  return key+counter;
}

module.exports = function (options) {
  var aliases = {};
  var connections = {};
  var interface = {
    hijack: {
      // splitter/auth/alias
      // splitter/wait/key
      // splitter/pull/key
      // splitter/emit/key
      request: function (req, res) {
        // console.log("HIJACK-REQUEST >> "+req.url);
        var parts = /^\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(req.url);
        if (!parts || parts[1] !== options.splitter)
          return false;
        if (parts[2] === "auth") {
          var alias = fresh(connections, parts[3]);
          var key = Crypto.randomBytes(32).toString("base64").replace(/[^A-Za-z0-9]/g, "");
          aliases[key] = alias;
          connections[alias] = Connection(Distribute(connections, alias), function (code, reason) {
            delete connections[alias];
            delete aliases[key];
            if (interface.ondisconnect)
              interface.ondisconnect(alias);
          });
          if (interface.onconnect)
            interface.onconnect(alias);
          res.end(alias+"/"+key);
        } else if (parts[3] in aliases) {
          connections[aliases[parts[3]]].onrequest(parts[2], req, res);
        } else {
          res.writeHead(400);
          res.end("key-not-found");
        }
        return true;
      },
      // /splitter/key
      socket: function (socket) {
        // console.log("HIJACK-SOCKET >> "+socket.upgradeReq.url);
        var parts = /^\/([^/]+)\/([^/]+)$/.exec(socket.upgradeReq.url);
        if (!parts || parts[1] !== options.splitter)
          return false;
        if (parts[2] in aliases) {
          connections[aliases[parts[2]]].onsocket(socket);
        } else {
          socket.close(4000, "key-not-found");
        }
        return true;
      }
    }
  };
  if ("alias" in options) {
    var emitters = {};
    emitters["$"] = Emitter(options.format, Distribute(connections, options.alias).bind(null, "$"));
    emitters["@"] = Emitter(options.format, Distribute(connections, options.alias).bind(null, "@"));
    connections[options.alias] = {
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
  }
  return interface;
};
