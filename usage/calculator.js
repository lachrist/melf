var MelfNode = require("melf/node");

var melf = MelfNode({
  alias: "calculator",
  url: "http://localhost:8080",
  splitter: "splitter",
  format: {
    stringify: function (x) { return x },
    parse: function (x) { return x }
  }
});

melf.sync.register("sphere", function (origin, data, callback) {
  var radius = melf.sync.emit(origin, "prompt", "Enter the sphere's radius:");
  if (data === "surface")
    return callback(null, 4 * Math.PI * radius * radius);
  if (data === "volume")
    return callback(null, 4/3 * Math.PI * radius * radius * radius);
  callback("cannot-process-data");
});

melf.sync.register("cube", function (origin, data, callback) {
  var edge = melf.sync.emit(origin, "prompt", "Enter the cube's edge:");
  if (data === "surface")
    return callback(null, 6 * edge * edge);
  if (data === "volume")
    return callback(null, edge * edge * edge);
  callback("cannot-process-data");
});
