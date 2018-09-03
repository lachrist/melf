const Net = require("net");
const MelfOrchestrator = require("../orchestrator.js");
const orchestrator = MelfOrchestrator((origin, recipient, message) => {
  console.log(origin+" >> "+recipient+": "+message);
});
const server = Net.createServer();
server.on("connection", orchestrator.ConnectionListener());
server.listen(process.argv[process.argv.length-1]);