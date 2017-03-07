
var Cut = require("./cut.js");

var address = location.protocol+"//"+location.hostname+":"+location.port

module.exports = function (address, alias) {
  address = (new URL(address, location)).href;
  if (address[address.length-1] !== "/")
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
