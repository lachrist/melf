var Path = require("path");
var ClientChannel = require("channel-cross-platform/client/node");
var Alice = require("../alice.js");
Alice(ClientChannel(Path.join(__dirname, "unix-socket")));