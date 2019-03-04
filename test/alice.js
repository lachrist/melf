const Melf = require("../lib/main.js");
Melf(process.argv[process.argv.length-1], "alice", (error, melf) => {
  if (error)
    throw error;
  melf.rprocedures.greeting = (origin, data, callback) => {
    melf.rpcall(origin, "echo", "Hello "+origin+", you said: "+JSON.stringify(data), callback);
  };
  melf.rprocedures.error = (origin, data, callback) => {
    callback(new Error("Sorry, "+origin+" there is an error..."));
  };
  melf.rprocedures.terminate = (origin, data, callback) => {
    callback(null, null);
    melf.terminate((error) => {
      if (error) {
        throw error;
      }
    });
  };
});