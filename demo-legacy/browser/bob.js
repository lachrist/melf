var ClientChannel = require("channel-cross-platform/client/browser");
var Bob = require("../bob.js");
Bob(ClientChannel(null, false, "foobar"));