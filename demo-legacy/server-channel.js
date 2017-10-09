var MelfServer = require("melf/server");
module.exports = function () {
  var mserver = MelfServer({
    onconnect: function (alias) {
      console.log(alias+" connected");
    },
    ondisconnect: function (alias) {
      console.log(alias+" disconnected");
    }
  });
  mserver.open("alice", "foo");
  mserver.open("bob", "bar");
  return mserver.channel;
};
