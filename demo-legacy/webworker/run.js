var Fs = require("fs");
var Path = require("path");
var Browserify = require("browserify");

function bundle (name) {
  var stream = Fs.createWriteStream(Path.join(__dirname, name+"-bundle.js"))
  Browserify(Path.join(__dirname, name+".js")).bundle().pipe(stream);
}
bundle("main");
bundle("alice");
bundle("bob");

console.log("Visit: file://"+Path.join(__dirname, "index.html"));
setInterval(function () {}, 1000);
process.on("SIGINT", function () {
  Fs.unlinkSync(Path.join(__dirname, "main-bundle.js"));
  Fs.unlinkSync(Path.join(__dirname, "alice-bundle.js"));
  Fs.unlinkSync(Path.join(__dirname, "bob-bundle.js"));
  process.exit(0);
});