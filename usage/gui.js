var Melf = require("melf/browser");

var melf = Melf({
  alias: "gui",
  url: "http://localhost:8080",
  splitter: "an-unused-url-path"
});

melf.sync.register("prompt", function (origin, data, callback) {
  callback(null, prompt(data));
});

alert(melf.sync.emit("calculator", "sphere", "surface"));

alert(melf.sync.emit("calculator", "cube", "volume"));
