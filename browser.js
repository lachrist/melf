
var Box = require("./box-ajax.js");
var Protocol = require("./protocol.js");

module.exports = function (options) {
  return Protocol(Box(options.channel, options.alias), options.alias, options.wait);
};
