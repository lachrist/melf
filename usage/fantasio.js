var Melf = require("melf/main-browser");
var melf = Melf("melf-channel", "fantasio", 100);
melf.sync.register("go", function (origin, data) {
  melf.sync.trigger(origin, "where", "keys");
  melf.sync.trigger(origin, "where", "car");
  return "Ok, I'm ready!";
});
