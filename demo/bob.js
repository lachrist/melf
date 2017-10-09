var Emitter = require("antena/emitter/worker");
var Melf = require("../main.js");
Melf({
  emitter: Emitter(),
  alias: "bob",
  key: "bar"
}, function (error, melf) {
  if (error)
    throw error;
  // This can get executed in the middle of a synchronous rcall!
  melf.rprocedures.echo = function (origin, data, callback) {
    console.log("echo "+origin+" "+data);
    callback(null, data);
  };
  function test (recipient, rname) {
    // synchronous remote procedure call //
    try {
      console.log(rname+"-sync data: "+melf.rcall(recipient, rname, rname+"-sync"));
    } catch (error) {
      console.log(rname+"-sync error: "+error);
    }
    // asynchornous remote procedure call //
    melf.rcall(recipient, rname, rname+"-async", function (error, data) {
      if (error)
        return console.log(rname+"-async error: "+error);
      console.log(rname+"-async data: "+data);
    });
  }
  test("alice", "greeting");
  test("alyce", "greeting");
  test("alice", "greetyng");
  test("alice", "error");
});