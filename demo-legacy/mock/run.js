var Mock = require("channel-cross-platform/mock");
var ServerChannel = require("../server-channel.js");
var Alice = require("../main.js");
var Bob = require("../surface.js");

var channel = Mock(ServerChannel());
Bob(channel);
setTimeout(Alice, 1000, channel);