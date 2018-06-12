const Ws = require("ws");
const Pool = require("./pool.js");

module.exports = (server, prefix, log) => {
  const pool = Pool(log);
  const wss = new Ws.Server({noServer:true});
  if (prefix) {
    server.on("request", (request, response) => {
      if (request.url.startsWith(prefix)) {
        pool.request(request.url.substring(prefix.length), response);
      }
    });
    server.on("upgrade", (request, socket, head) => {
      if (request.url.startsWith(prefix)) {
        wss.handleUpgrade(request, socket, head, (websocket) => {
          pool.connect(request.url.substring(prefix.length), websocket);
        });
      }
    });
  } else {
    server.on("request", (request, response) => {
      pool.request(request.url, response);
    });
    server.on("upgrade", (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (websocket) => {
        pool.connect(request.url, websocket);
      });
    });
  }
};