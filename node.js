
var Ws = require("ws");
var RequestNode = require("request-uniform/node");
var Melf = require("./main.js");

module.exports = function (options, callback) {
  options.request = RequestNode;
  options.WebSocket = Ws;
  return Melf(options, callback);
};
