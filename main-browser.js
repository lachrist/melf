
var Box = require("./box-ajax.js");
var Protocol = require("./protocol.js");

module.exports = function (address, alias, wait) {
  return Protocol(Box(address, alias), alias, wait);
};
