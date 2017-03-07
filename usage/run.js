
var Fs = require("fs");
var Http = require("http");
var ChildProcess = require("child_process");
var Browserify = require("browserify");
var Forward = require("melf/forward.js");

var boxdir = __dirname+"/boxdir";

// Cleanup previous communications
Fs.readdirSync(boxdir).forEach(function (name) {
  Fs.unlinkSync(boxdir+"/"+name);
});

// Startup Spirou
var spirou = ChildProcess.fork(__dirname+"/spirou.js", {stdio:"inherit"});

// Server Fantasio on port 8080
Browserify(__dirname+"/fantasio.js").bundle(function (error, bundle) {
  if (error)
    throw error;
  var forward = Forward(boxdir, "melf-channel");
  Http.createServer(function (req, res) {
    if (!forward(req, res)) {
      res.writeHead(200);
      res.end([
        "<!DOCTYPE html><html><head><meta charset=\"utf-8\">",
        "<script>"+bundle+"</script>",
        "</head><body></body></html>"
      ].join("\n"));
    }
  }).listen(8080);
});
