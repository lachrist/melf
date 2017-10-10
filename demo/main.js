const ReceptorMelf = require("../receptor/worker");
const receptor = ReceptorMelf({
  alice: "foo",
  bob: "bar"
}, (alias, socket) => {
  console.log(alias+" open");
  socket.on("close", (code, reason) => {
    console.log(alias+" close "+code+" "+reason);
  });
});
const alice = receptor.spawn("alice-bundle.js");
setTimeout(() => {
  const bob = receptor.spawn("bob-bundle.js");
  setTimeout(() => {
    alice.terminate();
    bob.terminate();
  }, 5000);
}, 5000);