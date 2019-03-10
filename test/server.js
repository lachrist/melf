const Net = require("net");
const Distributor = require("../lib/distributor.js");
const distributor = Distributor((origin, recipient, message) => {
  console.log(origin+" >> "+recipient+": "+message);
});
const server = Net.createServer();
server.on("connection", distributor.ConnectionListener());
server.listen(process.argv[process.argv.length-1]);
setTimeout(() => {
  server.close();
}, 2000);
process.on("exit", () => {
  console.log("exit");
});