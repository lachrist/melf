
var Cut = require("./cut.js");

module.exports = function (channel, alias) {
  var address = (new URL(channel, location)).href;
  if (channel[address.length-1] !== "/")
    address = address+"/";
  var cut = Cut();
  return {
    pull: function (wait) {
      var req = new XMLHttpRequest();
      req.open("POST", address+"pull/"+alias+"/"+wait, false);
      req.send();
      return cut(req.responseText);
    },
    send: function (recipient, msg) {
      var req = new XMLHttpRequest();
      req.open("POST", address+"send/"+recipient, false);
      req.send(msg);
    }
  };
};
