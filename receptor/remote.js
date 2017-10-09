
var Constants = require("../constants.js");
var Message = require("../message.js");

module.exports = function (con, post) {
  var counter = 0;
  var buffer = [];
  var pendings = [];
  con.on("close", function () {
    for (var i=0; i<pendings.length; i++) {
      var index = pendings[i].indexOf("/"); 
      post(pendings[i].substring(0, index), {
        echo: pendings[i].substring(index),
        error: "recipient-disconnected"
      });
    }
  });
  con.on("message", function (data) {
    var index = data.indexOf("/");
    if (index === -1)
      return con.close(4000, "cannot-parse-recipient");
    var recipient = data.substring(0, index);
    var message = Message.parse(data.substring(index+1));
    if (!message)
      return con.close(4000, "cannot-parse-message");
    if ("echo" in message) {
      var index = pendings.indexOf(recipient+"/"+message.echo);
      if (index === -1)
        return con.close(4000, "unmatched-echo");
      pendings.splice(index, 1);
    }
    post(recipient, message);
  });
  return {
    close: function (code, reason) {
      con.close(code, reason);
    },
    push: function (origin, message) {
      if ("token" in message)
        pendings.push(origin+"/"+message.token);
      var line = origin+"/"+Message.stringify(message);
      if (Array.isArray(buffer)) {
        buffer.push(line);
        con.send(counter.toString(Constants.radix)+"/"+line);
      } else {
        buffer(200, "OK", {}, line);
        buffer = [];
      }
      counter = counter === Constants.max ? 0 : counter+1;
    },
    pull: function (expect, callback) {
      if (!Array.isArray(buffer))
        return callback(400, "already-waiting", {}, "");
      var expect = parseInt(expect, Constants.radix);
      var slice = (counter >= expect) ? (counter - expect) : (counter - expect + Constants.max + 1);
      if (slice === 0)
        return buffer = callback;
      callback(200, "OK", {}, buffer.slice(buffer.length - slice).join("\n"));
      buffer = [];
    }
  };
};
