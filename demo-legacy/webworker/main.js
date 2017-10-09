var Webworker = require("channel-cross-platform/server/webworker");
var ServerChannel = require("../server-channel.js");
var webworker = Webworker(ServerChannel());
webworker("bob-bundle.js");
setTimeout(webworker, 1000, "alice-bundle.js");