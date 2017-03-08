var Melf = require("melf/browser");
var melf = Melf({
  channel: "melf-channel",
  alias: "fantasio"
});
melf.sync.register("go", function (origin, data) {
  melf.sync.trigger(origin, "where", "key");
  melf.sync.trigger(origin, "where", "car");
  return "Ok, I'm ready!";
});
