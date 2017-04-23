
var RequestUniform = require("request-uniform/browser");
var Client = require("./client.js");

module.exports = function (options, callback) {
  var request = RequestUniform(options.url+"/"+options.splitter);
  var Socket = function (key) {
    options.wsurl = options.wsurl || "ws"+options.url.substring(4);
    return new WebSocket(options.wsurl+"/"+options.splitter+"/"+key);
  }
  return Client(options.alias, options.debug, options.format, request, Socket, callback);
};
