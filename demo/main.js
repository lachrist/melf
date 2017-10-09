var ReceptorMelf = require("../receptor/worker");
var receptor = ReceptorMelf({
  alice: "foo",
  bob: "bar"
}, function (alias, socket) {
  console.log(alias+" open");
  socket.on("close", function (code, reason) {
    console.log(alias+" close "+code+" "+reason);
  });
});
var alice = receptor.spawn("alice.js");
setTimeout(function () {
  var bob = receptor.spawn("bob.js");
  setTimeout(function () {
    alice.terminate();
    bob.terminate();
  }, 1000);
}, 1000);