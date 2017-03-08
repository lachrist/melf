
var Box = require("./box-file.js");
var Protocol = require("./protocol.js");

module.exports = function (options) {
  return Protocol(Box(options.boxdir, options.alias), options.alias, Number(options.wait) || 10);
};
