var Melf = require("melf/browser");
var melf = Melf({
  channel: "melf-channel",
  alias: "fantasio"
});
melf.sync.register()
melf.sync.register("go", function (origin, data) {
  console.log(melf.sync.trigger(origin, "where", "key"));
  console.log(melf.sync.trigger(origin, "where", "car"));
  return origin+", I'm ready!";
});
