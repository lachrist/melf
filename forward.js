
var Url = require("url");
var Fs = require("fs");
var Consume = require("./consume.js");
var Produce = require("./produce.js");

module.exports = function (options) {
  var begin = Url.parse(options.channel).pathname;
  if (begin[begin.length-1] !== "/")
    begin = begin+"/";
  if (begin[0] !== "/")
    begin = "/"+begin;
  var consumers = {};
  var regexes = [
    /^pull\/([^\/]+)\/([0-9]+)$/,
    /^send\/([^\/]+)$/,
    /^alias\/([^\/]+)$/
  ];
  var handlers = [
    function pull (parts, req, res) {
      if (!(parts[1] in consumers))
        consumers[parts[1]] = Consume(options.boxdir+"/"+parts[1]);
      setTimeout(function () {
        res.end(consumers[parts[1]]().join("\n"));
      }, Number(parts[2]));
    },
    function send (parts, req, res) {
      var line = "";
      req.on("data", function (chunk) { line += chunk });
      req.on("end", function () {
        Produce(options.boxdir+"/"+parts[1], line);
        res.end();
      });
    },
    function alias (parts, req, res) {
      Fs.writeFile(options.boxdir+"/"+parts[1], "", "wx", function (error) {
        if (error && error.code !== "EEXIST")
          throw error;
        res.writeHead(error ? 400 : 200);
        res.end();
      });
    }
  ];
  return function (req, res) {
    if (req.method !== "POST" || !req.url.startsWith(begin))
      return false;
    var action = req.url.substring(begin.length);
    for (var i=0; i<regexes.length; i++) {
      var parts = regexes[i].exec(action);
      if (parts) {
        handlers[i](parts, req, res);
        return true;
      }
    }
    throw new Error("Cannot process action: "+action);
  }
};
