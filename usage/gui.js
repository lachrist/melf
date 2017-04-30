var MelfBrowser = require("melf/browser");

var melf = MelfBrowser({
  alias: "gui",
  url: "http://localhost:8080",
  splitter: "splitter",
  format: {
    stringify: function (x) { return x },
    parse: function (x) { return x }
  }
});

melf.sync.register("prompt", function (origin, data, callback) {
  callback(null, prompt(data));
});

alert(melf.sync.emit("calculator", "sphere", "surface"));

alert(melf.sync.emit("calculator", "cube", "volume"));
