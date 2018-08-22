const Net = require("net");
const MelfOrchestrator = require("../orchestrator.js");
const orchestrator = MelfOrchestrator((origin, recipient, message) => {
  console.log(origin+" >> "+recipient+": "+message);
});
const server = Net.createServer();
orchestrator.attach(server);
server.listen(process.argv[process.argv.length-1]);