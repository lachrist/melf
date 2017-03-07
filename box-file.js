
var Fs = require("fs");
var Path = require("path");
var Sleep = require("sleep");

var Cut = require("./cut.js");
var Produce = require("./produce.js");
var Consume = require("./consume.js");

module.exports = function (boxdir, alias) {
  boxdir = Path.resolve(boxdir);
  var path = boxdir+"/"+alias;
  var consume = Consume(path);
  var cut = Cut();
  return {
    pull: function (wait) {
      if (Number(wait))
        Sleep.msleep(Number(wait));
      return cut(consume());
    },
    send: function (recipient, msg) {
      Produce(boxdir+"/"+recipient, msg);
    },
  };
};
