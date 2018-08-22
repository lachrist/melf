
const Melf = require("../main.js");
const melf = Melf(process.argv[process.argv.length-1], "bob");

// rprocedures can be executed in the middle of a synchronous rcall!
melf.rprocedures.echo = (origin, data, callback) => {
  console.log("echoing to "+origin);
  callback(null, data);
};

const test = (recipient, rname, data, callback) => {
  console.log("BEGIN "+recipient+" "+rname);
  // synchronous remote procedure call //
  try {
    console.log(rname+"-sync-data: "+melf.rpcall(recipient, rname, data));
  } catch (error) {
    console.log(rname+"-sync-error", error.stack);
  }
  // asynchornous remote procedure call //
  melf.rpcall(recipient, rname, data, (error, data) => {
    if (error) {
      console.log(rname+"-async-error", error.stack);
    } else {
      console.log(rname+"-async-data: "+data);
    }
    console.log("END "+recipient+" "+rname);
    callback();
  });
};

test("alice", "greeting", "fablabla?", () => {
  test("alice", "error", null, () => {
    test("alice", "greetying", null, () => {
      process.exit(0);
    });
  });
});
