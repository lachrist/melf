
var RequestBrowser = require("request-uniform/browser");
var Melf = require("./main.js");

module.exports = function (options, callback) {
  options.request = RequestBrowser;
  options.WebSocket = WebSocket;
  return Melf(options, callback);
};
