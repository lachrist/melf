
const Url = require("url");
const Remote = require("./remote.js");
const Post = require("./post.js");

module.exports = (Receptor) => {
  return (keys, onopen) => {
    onopen = onopen || (() => {});
    const remotes = Object.create(null);
    const authentify = (parts) => {
      return parts && parts[1] in keys && (!keys[parts[1]] || keys[parts[1]] === parts[2]);
    };
    return Receptor({
      onrequest: (method, path, headers, body, callback) => {
        const parts = /^\/([^\/]+)\/([^\/]*)\/([0-9a-z]+)$/.exec(path);
        if (!authentify(parts))
          return callback(400, "authentification-failure", {}, "");
        if (!remotes[parts[1]])
          return callback(400, "disconnected", {}, "");
        remotes[parts[1]].pull(parseInt(parts[3], 36), callback);
      },
      onconnect: (path, con) => {
        const parts = /^\/([^\/]+)\/([^\/]*)$/.exec(path);
        if (!authentify(parts))
          return con.close(4000, "authentification-failure");
        if (remotes[parts[1]])
          return con.close(4000, "connected");
        remotes[parts[1]] = Remote(con, Post(remotes, parts[1]));
        con.on("close", () => delete remotes[parts[1]]);
        onopen(parts[1], con);
      }
    });
  };
};
