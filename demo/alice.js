var Emitter = require("antena/emitter/worker");
var Melf = require("../main.js");
Melf({
  emitter: Emitter(),
  alias: "alice",
  key: "foo"
}, function (error, melf) {
  if (error)
    throw error;
  melf.rprocedures.greeting = function (origin, data, callback) {
    melf.rcall(origin, "echo", "Hello "+origin+", you said: "+JSON.stringify(data), callback);
  };
  melf.rprocedures.error = function (origin, data, callback) {
    callback("Sorry, "+origin+" there is an error...");
  };
});