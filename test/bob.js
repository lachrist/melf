const Melf = require("../lib/main.js");
Melf(process.argv[process.argv.length-1], "bob", (error, melf) => {
  // RProcedures can be executed in the middle of a synchronous rcall!
  melf.rprocedures.echo = (origin, data, callback) => {
    console.log("echoing to "+origin);
    callback(null, data);
  };
  const test = (recipient, rpname, data, callback) => {
    console.log("BEGIN "+recipient+" "+rpname);
    // Synchronous remote procedure call //
    try {
      console.log(rpname+"-sync-data: "+melf.rpcall(recipient, rpname, data));
    } catch (error) {
      console.log(rpname+"-sync-error", error.stack);
    }
    // Asynchornous remote procedure call //
    melf.rpcall(recipient, rpname, data, (error, data) => {
      if (error) {
        console.log(rpname+"-async-error", error.stack);
      } else {
        console.log(rpname+"-async-data: "+data);
      }
      console.log("END "+recipient+" "+rpname);
      callback();
    });
  };
  test("alice", "greeting", "fablabla?", () => {
    test("alice", "error", null, () => {
      test("alice", "greetying", null, () => {
        melf.rpcall("alice", "terminate", null, (error) => {
          melf.terminate((error) => {
            if (error) {
              throw error;
            }
          });
        });
      });
    });
  });  
});