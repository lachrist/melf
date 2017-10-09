var Path = require("path");
var ClientChannel = require("channel-cross-platform/client/node");
var Bob = require("../bob.js");
Bob(ClientChannel(Path.join(__dirname, "unix-socket")));