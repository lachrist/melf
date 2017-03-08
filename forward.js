
var Url = require("url");
var Consume = require("./consume.js");
var Produce = require("./produce.js");

module.exports = function (options) {
  var begin = Url.parse(options.channel).pathname;
  if (begin[begin.length-1] !== "/")
    begin = begin+"/";
  if (begin[0] !== "/")
    begin = "/"+begin;
  var consumers = {};
  return function (req, res) {
    if (req.method !== "POST" || !req.url.startsWith(begin))
      return false;
    var action = req.url.substring(begin.length);
    var pull = /^pull\/([^\/]+)\/([0-9]+)$/.exec(action);
    var send = /^send\/([^\/]+)$/.exec(action);
    if (pull) {
      if (!(pull[1] in consumers))
        consumers[pull[1]] = Consume(options.boxdir+"/"+pull[1]);
      setTimeout(function () {
        res.end(consumers[pull[1]]());
      }, Number(pull[2]));
    } else if (send) {
      var line = "";
      req.on("data", function (chunk) { line += chunk });
      return req.on("end", function () {
        Produce(options.boxdir+"/"+send[1], line);
        res.end();
      });
    } else {
      throw new Error("Cannot process url: "+req.url);
    }
    return true;
  }
};
