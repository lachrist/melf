
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

module.exports = function (path, line) {
  console.log(Path.basename(path)+" << "+line);
  var buffer = Buffer.from(line+"\n", "utf8");
  if (buffer.length < 512)
    return Fs.appendFileSync(path, buffer);
  truncate(path, line, process.pid+"#"+(counter++)+"|");
};

function truncate (path, line, prefix) {
  var begin = 0;
  while (begin < text.length) {
    var size = 450;
    do {
      var buffer = Buffer.from(prefix+text.substring(begin, size)+"\n", "utf8");
      size -= 100;
    } while (buffer.length > 512);
    Fs.appendFileSync(path, buffer);
    begin += size;
  }
  Fs.appendFileSync(path, prefix+"\n", {encoding:"utf8"});
  return buffers;
};
