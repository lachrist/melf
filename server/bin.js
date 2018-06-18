#!/usr/bin/env node
const Http = require("http");
const Minimist = require("minimist");
const Handlers = require("./handlers.js");
const options = Minimist(process.argv.slice(2));
const handlers = Handlers(options.log && console);
const server = Http.createServer();
server.on("request", handlers.request);
server.on("upgrade", handlers.upgrade);
server.listen(options.port, function () {
  options.log && console.log("Listening on", this.address());
});