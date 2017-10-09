var ClientChannel = require("channel-cross-platform/client/browser");
var Alice = require("../alice.js");
Alice(ClientChannel(null, false, "foobar"));