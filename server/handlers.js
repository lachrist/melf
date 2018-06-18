const SplitIn = require("../split-in.js");
const Ws = require("ws");

const max = parseInt("zzzz", 36);

module.exports = (logger) => {

  const websockets = {};

  const wss = new Ws.Server({noServer:true});

  function onmessage (message) {
    logger && logger.log(this._melf_alias, ">>", message);
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
    logger && logger.log(this._melf_alias, "DISCONNECTED", code, reason);
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
      const message = this._melf_counter.toString(36)+"/"+meteor
      this.send(message);
      logger && logger.log(this._melf_alias, "<<", message);
    } else {
      this._melf_buffer.end(meteor);
      logger && logger.log(this._melf_alias, meteor);
      this._melf_buffer = [];
    }
    this._melf_counter++;
    if (this._melf_counter > max) {
      this._melf_counter = 0
    }
  };

  return {
    upgrade: (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (websocket) => {
        const alias = request.url.substring(1);
        if (alias in websockets) {
          let counter = 0;
          while (alias+"-"+counter in websockets)
            counter++;
          alias = alias+"-"+counter;
        }
        websockets[alias] = websocket;
        websocket.send(alias);
        logger && logger.log(alias, "CONNECTED");
        websocket._melf_alias = alias;
        websocket._melf_push = _melf_push;
        websocket._melf_buffer = [];
        websocket._melf_counter = 0;
        websocket._melf_pendings = [];
        websocket.on("close", onclose);
        websocket.on("message", onmessage);
      });
    },
    request: (request, response) => {
      let [,alias, expect] = request.url.split("/");
      expect = parseInt(expect, 36);
      if (alias in websockets) {
        if (Array.isArray(websockets[alias]._melf_buffer)) {
          const counter = websockets[alias]._melf_counter;
          const slice = (counter>=expect) ? (counter-expect) : (counter-expect+max+1);
          if (slice === 0) {
            websockets[alias]._melf_buffer = response;
          } else {
            const buffer = websockets[alias]._melf_buffer;
            const body = buffer.slice(buffer.length-slice).join("\n");
            response.end(body);
            logger && logger.log(alias, body);
            websockets[alias]._melf_buffer = [];
          }
        } else {
          lloggerog && logger.log("WARNING", alias, "already waiting");
          response.writeHead(400, "Already waiting");
          response.end();
        }
      } else {
        logger && logger.log("WARNING", alias, "not connected");
        response.writeHead(400, "Not connected");
      }
    }
  };

}