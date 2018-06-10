const SplitIn = require("../split-in.js");

const log = (message) => (console.log(message), message);

const max = parseInt("zzzz", 36);

module.exports = () => {

  const websockets = {};

  function onmessage (message) {
    log(this._melf_alias+" >> "+message);
    const [recipient, meteor] = SplitIn(message, "/", 2);
    if (meteor[0] === "/") {
      const [,echo] = meteor.split("/", 2);
      const index = this._melf_pendings.indexOf(recipient+"/"+echo);
      if (index === -1) {
        return this.close(4000, "Unmatched echo");
      }
      this._melf_pendings.splice(index, 1);
    }
    if (recipient in websockets) {
      websockets[recipient]._melf_push(meteor);
    } else if (meteor[0] !== "/") {
      const [,token] = meteor.split("/", 2);
      const error = new Error("Recipient not found");
      this._melf_push("/"+token+"/e/"+JSON.stringify([error.message, error.stack]));
    }
  };

  function onclose (code, reason) {
    log(this._melf_alias+" DISCONNECTED "+code+" "+reason);
    delete websockets[this._melf_alias];
    const error = new Error("Recipient disconnected: "+reason+" ("+code+")");
    const output = JSON.stringify([error.message, error.stack]);
    for (let index=0; index<this._melf_pendings.length; index++) {
      const [origin, token] = this._melf_pendings[index].split("/");
      if (origin in websockets) {
        websockets[origin]._melf_push("/"+token+"/e/"+output);
      }
    }
  };

  function _melf_push (meteor) {
    if (meteor[0] !== "/") {
      const [origin, token] = meteor.split("/", 2);
      this._melf_pendings.push(origin+"/"+token);
    }
    if (Array.isArray(this._melf_buffer)) {
      this._melf_buffer.push(meteor);
      this.send(this._melf_counter.toString(36)+"/"+meteor);
      log(this._melf_alias+" << "+this._melf_counter.toString(36)+"/"+meteor);
    } else {
      buffer.end(meteor);
      log(this._melf_alias+" "+meteor);
      buffer = [];
    }
    this._melf_counter++;
    if (this._melf_counter > max) {
      this._melf_counter = 0
    }
  };

  return {
    connect: (path, websocket) => {
      const alias = path.substring(1);
      if (alias in websockets) {
        let counter = 0;
        while (alias+"-"+counter in websockets)
          counter++;
        alias = alias+"-"+counter;
      }
      websockets[alias] = websocket;
      websocket.send(alias);
      log(alias+" CONNECTED");
      websocket._melf_alias = alias;
      websocket._melf_push = _melf_push;
      websocket._melf_buffer = [];
      websocket._melf_counter = 0;
      websocket._melf_pendings = [];
      websocket.on("close", onclose);
      websocket.on("message", onmessage);
    },
    pull: (path, response) => {
      let [,alias, expect] = path.split("/");
      expect = parseInt(expect, 36);
      if (alias in websockets) {
        if (Array.isArray(websockets[alias]._melf_buffer)) {
          const counter = websockets[alias]._melf_counter;
          const slice = (counter>=expect) ? (counter-expect) : (counter-expect+max+1);
          if (slice === 0) {
            websockets[alias]._melf_buffer = response;
          } else {
            const buffer = websockets[alias]._melf_buffer;
            response.end(buffer.slice(buffer.length-slice).join("\n"));
            log(alias+"\n"+buffer.slice(buffer.length-slice).join("\n  "));
            websockets[alias]._melf_buffer = [];
          }
        } else {
          log("WARNING "+alias+" already waiting");
          response.writeHead(400, "Already waiting");
          response.end();
        }
      } else {
        log("WARNING "+alias+" not connected");
        response.writeHead(400, "Not connected");
      }
    }
  };

}