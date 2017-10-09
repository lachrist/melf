
var Url = require("url");
var Remote = require("./remote.js");
var Post = require("./post.js");
var Constants = require("../constants.js");

module.exports = function (Receptor) {
  return function (keys, onopen) {
    var remotes = Object.create(null);
    function authentify (parts) {
      return parts && parts[1] in keys && (!keys[parts[1]] || keys[parts[1]] === parts[2]);
    }
    return Receptor({
      onrequest: function (method, path, headers, body, callback) {
        var parts = /^\/([^\/]+)\/([^\/]*)\/([0-9a-z]+)$/.exec(path);
        if (!authentify(parts))
          return callback(400, "authentification-failure", {}, "");
        if (!remotes[parts[1]])
          return callback(400, "disconnected", {}, "");
        remotes[parts[1]].pull(parts[3], callback);
      },
      onconnect: function (path, con) {
        var parts = /^\/([^\/]+)\/([^\/]*)$/.exec(path);
        if (!authentify(parts))
          return con.close(4000, "authentification-failure");
        if (remotes[parts[1]])
          return con.close(4000, "connected");
        remotes[parts[1]] = Remote(con, Post(remotes, parts[1]));
        con.on("close", function (code, reason) {
          delete remotes[parts[1]];
        });
        onopen && onopen(parts[1], con);
      }
    });
  };
};
