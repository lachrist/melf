var Http = require("http");
var Path = require("path");
var Fs = require("fs");
var ChildProcess = require("child_process");
var Handle = require("channel-cross-platform/server/handle");
var ServerChannel = require("../server-channel.js");

var handle = Handle(ServerChannel());
Http.createServer().on("request", handle.request).on("upgrade", handle.upgrade).listen(Path.join(__dirname, "unix-socket"), function () {
  ChildProcess.fork(Path.join(__dirname, "bob.js"), {stdio:[0, 1, 2, "ipc"]});
  setTimeout(ChildProcess.fork, 1000, Path.join(__dirname, "alice.js"), {stdio:[0, 1, 2, "ipc"]});
});
process.on("SIGINT", function () {
  Fs.unlinkSync(Path.join(__dirname, "unix-socket"));
  process.exit(0);
});