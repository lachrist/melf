
var Agent = require("./agent.js");
var Message = require("./message.js");
var Constants = require("./constants.js");

module.exports = function (options, callback) {
  var path = "/"+options.alias+"/"+options.key;
  var expect = 0;
  function online (line) {
    expect = expect === Constants.max ? 0 : expect+1;
    var index = line.indexOf("/");
    agent.receive(line.substring(0, index), Message.parse(line.substring(index+1)));
  }
  var agent = Agent(options.format||JSON, function (recipient, event) {
    con.send(recipient+"/"+Message.stringify(event));
  });
  var con = options.emitter.connect(path);
  con.on("message", function (message) {
    var index = message.indexOf("/");
    if (expect === parseInt(message.substring(0, index), Constants.radix)) {
      online(message.substring(index+1));
    }
  });
  con.on("error", callback);
  con.on("open", function () {
    con.removeAllListeners("error");
    con.alias = options.alias;
    con.rprocedures = agent.rprocedures;
    con.rcall = function (recipient, name, data, callback) {
      if (callback)
        return agent.rcall(recipient, name, data, callback);
      var pending = true;
      var result = null;
      agent.rcall(recipient, name, data, function (error, data) {
        if (error)
          throw error;
        pending = false;
        result = data;
      });
      while (pending) {
        var res = options.emitter.request("GET", path+"/"+expect.toString(36), {}, null);
        if (res[0] || res[1] !== 200)
          throw res[0] || new Error(res[1]+" ("+res[2]+")");
        res[4].split("\n").forEach(online);
      }
      return result;
    }
    callback(null, con);
  });
};
