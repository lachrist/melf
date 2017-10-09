var Melf = require("melf");
module.exports = function (channel) {
  Melf({alias:"bob", key:"bar", channel:channel}, function (melf) {
    melf.receive("greeting", function (origin, data, callback) {
      var name = melf.send(origin, "name", null);
      callback(null, "Hello, "+origin+" "+name+", I'm bob!");
    });
  });
}