var Melf = require("melf");
var Client = require("client-uniform/node");
var Minimist = require("minimist");

var options = Minimist(process.argv.slice(2));

function identity (x) { return x }

var melf = Melf({
  client: Client("localhost:"+options.port),
  splitter: options.splitter,
  alias: "calculator",
  format: {stringify:identity, parse:identity}
});

melf.on("sphere", function (origin, data, callback) {
  var radius = melf.emit(origin, "prompt", "Enter the sphere's radius:");
  if (data === "surface")
    return callback(null, "The sphere surface is: "+(4*Math.PI*radius*radius));
  if (data === "volume")
    return callback(null, "The sphere volume is: "(4/3 * Math.PI * radius * radius * radius));
  callback("cannot-process-data");
});

melf.on("cube", function (origin, data, callback) {
  var edge = melf.emit(origin, "prompt", "Enter the cube's edge:");
  if (data === "surface")
    return callback(null, "The cube surface is: "+(6*edge*edge));
  if (data === "volume")
    return callback(null, "The cube volume is: "+(edge*edge*edge));
  callback("cannot-process-data");
});
