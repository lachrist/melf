const Net = require("net");
const MelfReceptor = require("../lib/receptor.js");
const receptor = MelfReceptor((origin, recipient, message) => {
  console.log(origin+" >> "+recipient+": "+message);
});
const server = Net.createServer();
server.on("connection", receptor.ConnectionListener());
server.listen(process.argv[process.argv.length-1]);