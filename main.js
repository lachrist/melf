
var Box = require("./box-file.js");

module.exports = function (boxdir, alias, wait) {
  return Protocol(Box(boxdir, alias), alias, wait);
};
