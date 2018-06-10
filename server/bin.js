#!/usr/bin/env node
const Http = require("http");
const Attach = require("./attach.js");
Attach(Http.createServer().listen(process.argv[2], function () {
  console.log("Listening on", this.address());
}));