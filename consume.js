
var Fs = require("fs");
var Path = require("path");
var Sleep = require("sleep");

// Previously based on renameSync:
// try {
//   Fs.renameSync(path, path+".tmp");
// } catch (error) {
//   console.log("Empty?");
//   if (error.code === "ENOENT") {
//     console.log("Empt!!!");
//     return "";
//   }
//   throw error;
// }
// var content = Fs.readFileSync(path+".tmp", {encoding:"ascii"});
// Fs.unlinkSync(path+".tmp");
// return content;

var length = 1000;

module.exports = function (path) {
  Fs.appendFileSync(path, "", "ascii");
  var fd = Fs.openSync(path, "r");
  return function () {
    var buffer = Buffer.alloc(length);
    var size = Fs.readSync(fd, buffer, 0, length, null);
    var str = buffer.toString("ascii", 0, size);
    return str;
  };
};
