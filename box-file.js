
var Fs = require("fs");
var Sleep = require("sleep");
var Path = require("path")

var Produce = require("./produce.js");
var Consume = require("./consume.js");

module.exports = function (boxdir, alias) {
  boxdir = Path.resolve(boxdir);
  if (typeof alias === "function") {
    while (true) {
      try {
        var path = boxdir+"/"+alias();
        Fs.writeFileSync(path, "", {flag:"wx"});
        break;
      } catch (error) {
        if (error.code !== "EEXIST")
          throw error;
      }
    }
  } else {
    var path = boxdir+"/"+alias;
  }
  var consume = Consume(path);
  return {
    alias: Path.basename(path),
    pull: function (wait) {
      if (wait)
        Sleep.msleep(wait);
      return consume().map(JSON.parse);
    },
    send: function (recipient, data) {
      Produce(boxdir+"/"+recipient, JSON.stringify(data));
    },
  };
};
