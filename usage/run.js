
var Ws = require("ws");
var Http = require("http");
var ChildProcess = require("child_process");
var Browserify = require("browserify");
var MelfServer = require("melf/server");

var child = ChildProcess.fork(__dirname+"/calculator.js", {stdio: "inherit"});

Browserify(__dirname+"/gui.js").bundle(function (error, bundle) {
  if (error)
    throw error;
  var mserver = MelfServer({splitter: "an-unused-url-path"});
  mserver.onconnect = function (alias) { console.log(alias+" connected") };
  mserver.ondisconnect = function (alias) { console.log(alias+" disconnected") };
  var server = Http.createServer(function (req, res) {
    msert.hijack.request(req, res) || res.end([
      "<!DOCTYPE html><html><head><meta charset=\"utf-8\">",
      "<script>"+bundle+"</script>",
      "</head><body>Best GUI evaa!</body></html>"
    ].join("\n"));
  }).listen(8080);
  new Ws.Server({server:server}).on("connection", mserver.hijack.socket);
});
