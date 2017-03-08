
var Melf = require("melf");
var melf = Melf({
  boxdir: __dirname+"/boxdir",
  alias: "spirou"
});
melf.sync.register("where", function (origin, data) {
  return origin+", the "+data+" is right there!";
});
melf.sync.trigger("fantasio", "go", "let's go!");
