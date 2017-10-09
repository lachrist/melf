var Fs = require("fs");
var Path = require("path");
var Http = require("http");
var Url = require("url");
var Browserify = require("browserify");
var Intercept = require("channel-cross-platform/server/intercept");
var ServerChannel = require("../server-channel.js");

function bundle (name) {
  var stream = Fs.createWriteStream(Path.join(__dirname, name+"-bundle.js"))
  Browserify(Path.join(__dirname, name+".js")).bundle().pipe(stream);
}
bundle("alice");
bundle("bob");

var port = 8080;
var intercept = Intercept("foobar", ServerChannel());
var whitelist = ["/alice.html", "/alice-bundle.js", "/bob.html", "/bob-bundle.js"];
Http.createServer().on("request", function (req, res) {
  if (!intercept.request(req, res)) {
    var path = Url.parse(req.url).path;
    if (whitelist.indexOf(path) !== -1)
      return Fs.createReadStream(Path.join(__dirname, path.substring(1))).pipe(res);
    res.writeHead(404, "not-found");
    res.end();
  }
}).on("upgrade", function (req, socket, head) {
  if (!intercept.upgrade(req, socket, head)) {
    req.writeHead(400, "not-intercepted");
    req.end();
  }
}).listen(port, function () {
  console.log("1) visit http://localhost:"+port+"/bob.html");
  console.log("2) visit http://localhost:"+port+"/alice.html");
});
process.on("SIGINT", function () {
  Fs.unlinkSync(Path.join(__dirname, "alice-bundle.js"));
  Fs.unlinkSync(Path.join(__dirname, "bob-bundle.js"));
  process.exit(0);
});