#!/usr/bin/env node
const Http = require("http");
const Attach = require("./attach.js");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
Attach(Http.createServer().listen(options.port, function () {
  console.log("Listening on", this.address());
}), null, options.log && console.log.bind(console));