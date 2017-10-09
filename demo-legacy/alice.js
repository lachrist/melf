var Melf = require("melf");
module.exports = function (channel) {
  Melf({alias:"alice", key:"foo", channel:channel}, function (melf) {
    melf.receive("name", function (origin, data, callback) {
      callback(null, "coltrane");
    });
    var greeting = melf.send("bob", "greeting", null);
    console.log(greeting);
    melf.disconnect(1000, "done");
  });
};