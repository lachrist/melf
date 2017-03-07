
// We use ascii encoding to be sure that
// if the fil ewritting is not atomic
// (>65536 bytes in OSX), consumption
// will still result in proper a string.

var Fs = require("fs");
var Path = require("path");

function escape (str) {
  return str.replace(/\\+n/g, function (match) { return "\\"+match }).replace("\n", "\\n");
}

module.exports = function (path, line) {
  console.log(Path.basename(path)+" << "+line);
  line = escape(line);
  if (!/^[\x00-\x7F]*$/.test(line))
    throw new Error("Box can only handle ASCII strings, got: "+line);
  Fs.appendFileSync(path, Buffer.from(line+"\n", "ascii"));
};
