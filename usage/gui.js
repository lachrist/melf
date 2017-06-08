var Melf = require("melf");
var Client = require("client-uniform/browser");

function identity (x) { return x }

var melf = Melf({
  client: Client("localhost:8080"),
  alias: "gui",
  format: {stringify:identity, parse:identity}
});

melf.on("prompt", function (origin, data, callback) {
  callback(null, prompt(data));
});

alert(melf.emit("calculator", "sphere", "surface"));

alert(melf.emit("calculator", "cube", "volume"));
