
var Melf = require("melf");
var melf = Melf(__dirname+"/boxdir", "spirou", 100);
melf.sync.register("where", function (origin, data) {
  return origin+", "+data+" is right there!";
});
melf.sync.trigger("fantasio", "go", "let's go!");
