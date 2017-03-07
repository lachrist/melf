
var Box = require("./box-file.js");
var Protocol = require("./protocol.js");

module.exports = function (boxdir, alias, wait) {
  return Protocol(Box(boxdir, alias), alias, wait);
};
