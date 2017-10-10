
const MeteorGetToken = require("./meteor-get-token.js");
const MeteorGetEcho = require("./meteor-get-echo.js");

const max = parseInt("zzzz", 36);

module.exports = (con, post) => {
  let counter = 0;
  let buffer = [];
  const pendings = [];
  con.on("close", () => {
    for (let i=0; i<pendings.length; i++) {
      let index = pendings[i].indexOf("/"); 
      post(pendings[i].substring(0, index), {
        echo: pendings[i].substring(index),
        error: new Error("Recipient disconnected")
      });
    }
  });
  con.on("message", (message) => {
    const index1 = message.indexOf("/");
    if (index1 === -1)
      return con.close(4000, "cannot-parse-recipient");
    const recipient = message.substring(0, index1);
    const mstring = message.substring(index1+1);
    const echo = MeteorGetEcho(mstring);
    if (echo) {
      const index2 = pendings.indexOf(recipient+"/"+echo);
      if (index2 === -1)
        return con.close(4000, "unmatched-echo");
      pendings.splice(index2, 1);
    }
    post(recipient, mstring);
  });
  return {
    close: (code, reason) => { con.close(code, reason) },
    push: (origin, mstring) => {
      const token = MeteorGetToken(mstring);
      if (token)
        pendings.push(origin+"/"+token);
      const line = origin+"/"+mstring;
      if (Array.isArray(buffer)) {
        buffer.push(line);
        con.send(counter.toString(36)+"/"+line);
      } else {
        buffer(200, "OK", {}, line);
        buffer = [];
      }
      counter++;
      if (counter > max) {
        counter = 0;
      }
    },
    pull: (expect, callback) => {
      if (!Array.isArray(buffer))
        return callback(400, "already-waiting", {}, "");
      const slice = (counter>=expect) ? (counter-expect) : (counter-expect+max+1);
      if (slice === 0)
        return buffer = callback;
      callback(200, "OK", {}, buffer.slice(buffer.length-slice).join("\n"));
      buffer = [];
    }
  };
};
