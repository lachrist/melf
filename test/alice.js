const Melf = require("../main.js");
const melf = Melf(process.argv[process.argv.length-1], "alice");
melf.rprocedures.greeting = (origin, data, callback) => {
  melf.rpcall(origin, "echo", "Hello "+origin+", you said: "+JSON.stringify(data), callback);
};
melf.rprocedures.error = (origin, data, callback) => {
  callback(new Error("Sorry, "+origin+" there is an error..."));
};