#!/usr/bin/env node
const Http = require("http");
const Subscribe = require("./subscribe.js");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
Subscribe(Http.createServer().listen(options.port, function () {
  console.log("Listening on", this.address());
}), options.log && console.log.bind(console));