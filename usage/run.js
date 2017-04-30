
var Ws = require("ws");
var Http = require("http");
var ChildProcess = require("child_process");
var Browserify = require("browserify");
var MelfHijack = require("melf/hijack");

var child = ChildProcess.fork(__dirname+"/calculator.js", {stdio: "inherit"});

Browserify(__dirname+"/gui.js").bundle(function (error, bundle) {
  if (error)
    throw error;
  var mhijack = MelfServer({splitter:"splitter", debug:true});
  mhijack.on("authentify", function (alias) { console.log(alias+ " authentified") });
  mhijack.on("connect", function (alias) { console.log(alias+" connected") });
  mhijack.on("disconnect", function (alias) { console.log(alias+" disconnected") });
  var server = Http.createServer(function (req, res) {
    mhijack.request(req, res) || res.end([
      "<!DOCTYPE html><html><head><meta charset=\"utf-8\">",
      "<script>"+bundle+"</script>",
      "</head><body>Best GUI evaa!</body></html>"
    ].join("\n"));
  }).listen(8080);
  new Ws.Server({server:server}).on("connection", mhijack.socket);
});
