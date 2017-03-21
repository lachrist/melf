
module.exports = function (channel, alias) {
  var address = (new URL(channel, location)).href;
  if (channel[address.length-1] !== "/")
    address = address+"/";
  if (typeof alias === "function") {
    alias = (function () {
      while (true) {
        var a = alias();
        var req = open("POST", address+"alias/"+a, false);
        req.send();
        if (req.status === 200)
          return a;
      }
    } ());
  }
  return {
    alias: alias,
    pull: function (wait) {
      var req = new XMLHttpRequest();
      req.open("POST", address+"pull/"+alias+"/"+wait, false);
      req.send();
      return req.responseText ? req.responseText.split("\n").map(JSON.parse) : [];
    },
    send: function (recipient, data) {
      var req = new XMLHttpRequest();
      req.open("POST", address+"send/"+recipient, false);
      req.send(JSON.stringify(data));
    }
  };
};
