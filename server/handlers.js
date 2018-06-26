const SplitIn = require("../split-in.js");
const Ws = require("ws");

const max = parseInt("zzzz", 36);

module.exports = (logger) => {

  const websockets = {};

  const wss = new Ws.Server({noServer:true});

  function onmessage (message) {
    const [recipient, meteor] = SplitIn(message, "/", 2);
    logger && logger.log(this._melf_alias, ">>", recipient, meteor);
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
    if (Array.isArray(this._melf_pull)) {
      this.send(meteor);
      this._melf_pull.push(meteor);
    } else {
      const body = Buffer.from(meteor, "utf8");
      this._melf_pull.writeHead(200, "Ok", {"Content-Length":body.length, "Content-Type":"text/plain; charset=utf8"});
      this._melf_pull.end(body);
      this._melf_pull = [];
      logger && logger.log(this._melf_alias, "delayed-pull-response", meteor);
    }
  };

  return {
    upgrade: (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (websocket) => {
        let alias = request.url.substring(1);
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
        websocket._melf_pull = [];
        websocket._melf_pendings = [];
        websocket.on("close", onclose);
        websocket.on("message", onmessage);
      });
    },
    request: (request, response) => {
      let [,alias] = request.url.split("/");
      logger && logger.log(alias, "pull-request");
      if (alias in websockets) {
        const pull = websockets[alias]._melf_pull;
        if (Array.isArray(pull)) {
          if (pull.length) {
            const body = Buffer.from(pull.join("\n"), "utf8");
            response.writeHead(200, "Ok", {"Content-Length":body.length, "Content-Type":"text/plain; charset=utf8"});
            response.end(body);
            if (logger) {
              if (pull.length === 1) {
                logger.log(alias, "immediate-pull-response", pull[0]);
              } else {
                logger.log(alias, "immediate-pull-response\n  "+pull.join("\n  "));
              }
            }
            websockets[alias]._melf_pull = [];
          } else {
            websockets[alias]._melf_pull = response;
          }
        } else {
          logger && logger.error(alias, "ALREADY WAITING");
          response.writeHead(400, "Already waiting", {"Content-Length": 0, "Content-Type":"text/plain; charset=utf8"});
          response.end();
        }
      } else {
        logger && logger.error(alias, "NOT CONNECTED");
        response.writeHead(400, "Not connected", {"Content-Length": 0, "Content-Type":"text/plain; charset=utf8"});
        response.end();
      }
    }
  };

}