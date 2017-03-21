
var Fs = require("fs");
var Path = require("path");

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

var length = 512;

module.exports = function (path) {
  var pendings = {};
  Fs.appendFileSync(path, "", "utf8");
  var fd = Fs.openSync(path, "r");
  function filter (line) {
    var parts = /^([0-9]+\#[0-9]+)\|(.+)$/.exec(line);
    if (parts)
      pendings[parts[1]] = (pendings[parts[1]] || "") + parts[2];
    return !parts;
  };
  function map (line) {
    var parts = /^([0-9]+\#[0-9]+)\|$/.exec(line);
    if (parts) {
      line = pendings[parts[1]];
      delete pendings[parts[1]];
    }
    return line;
  }
  return function () {
    var buffers = [];
    while (true) {
      var buffer = Buffer.allocUnsafe(length);
      var size = Fs.readSync(fd, buffer, 0, length, null);
      buffers.push(buffer);
      if (size < length) {
        var total = length * (buffers.length-1) + size;
        var lines = Buffer.concat(buffers, total).toString("utf8", 0, total).split("\n");
        lines.pop();
        return lines.filter(filter).map(map);
      }
    }
  };
};


