
var Ws = require("ws");
var Path = require("path");
var RequestUniform = require("request-uniform/node");
var Client = require("./client.js");

module.exports = function (options, callback) {
  if (/^https?:\/\//.test(options.url)) {
    var request = RequestUniform(options.url+"/"+options.splitter);
  } else {
    var request = RequestUniform({
      protocol: "http:",
      socket: Path.resolve(options.url),
      prefix: "/"+options.splitter
    });
  }
  var Socket = function (key) {
    if (!options.wsurl) {
      options.wsurl = /^https?:\/\//.test(options.url)
        ? "ws"+options.url.substring(4)
        : "ws+unix://"+Path.resolve(options.url)+":";
    }
    return new Ws(options.wsurl+"/"+options.splitter+"/"+key);
  }
  return Client(options.alias, options.debug, options.format, request, Socket, callback);
};
