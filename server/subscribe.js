const Ws = require("ws");
const Pool = require("./pool.js");

module.exports = (server, log) => {
  const pool = Pool(log);
  const wss = new Ws.Server({noServer:true});
  server.on("request", (request, response) => {
    pool.request(request.url, response);
  });
  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (websocket) => {
      pool.connect(request.url, websocket);
    });
  });
};
