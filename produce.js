
// http://manpages.courier-mta.org/htmlman7/pipe.7.html
// > ulimit -a
// POSIX.1 says that write(2)s of less than PIPE_BUF bytes
// must be atomic: the output data is written to the pipe
// as a contiguous sequence. Writes of more than PIPE_BUF
// bytes may be nonatomic: the kernel may interleave the
// data with data written by other processes. POSIX.1
// requires PIPE_BUF to be at least 512 bytes.
// (On Linux, PIPE_BUF is 4096 bytes.)

var Fs = require("fs");
var Path = require("path");

var counter = 0;
var PIPE_BUF = 512;

module.exports = function (path, line) {
  console.log(Path.basename(path)+" << "+line);
  var buffer = Buffer.from(line+"\n", "utf8");
  if (buffer.length < PIPE_BUF)
    return Fs.appendFileSync(path, buffer);
  truncate(path, line, process.pid+"#"+(counter++)+"|");
};

function truncate (path, line, prefix) {
  var begin = 0;
  while (begin < line.length) {
    var size = 500;
    do {
      size -= 50;
      var buffer = Buffer.from(prefix+line.substring(begin, begin+size)+"\n", "utf8");
    } while (buffer.length > PIPE_BUF);
    Fs.appendFileSync(path, buffer);
    begin += size;
  }
  Fs.appendFileSync(path, Buffer.from(prefix+"\n", "utf8"));
};
