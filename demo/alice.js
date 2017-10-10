const Emitter = require("antena/emitter/worker");
const Melf = require("../main.js");
Melf({
  emitter: Emitter(),
  alias: "alice",
  key: "foo"
}, (error, melf) => {
  if (error)
    throw error;
  melf.rprocedures.greeting = (origin, data, callback) => {
    melf.rcall(origin, "echo", "Hello "+origin+", you said: "+JSON.stringify(data), callback);
  };
  melf.rprocedures.error = (origin, data, callback) => {
    callback(new Error("Sorry, "+origin+" there is an error..."));
  };
});