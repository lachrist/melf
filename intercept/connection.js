
var Event = require("../event.js");

module.exports = function (send) {
  var mock = [];
  mock.send = mock.push;
  var response = null;
  var lines = [];
  var pendings = [];
  function onemit (line) {
    var parts = /^([^/]*)\/(.*)$/.exec(line);
    if (!parts)
      return "cannot-parse-recipient";
    var recipient = parts[1];
    var event = Event.parse(parts[2]);
    if ("echo" in event) {
      var index = pendings.indexOf(recipient+"/"+event.echo);
      if (index === -1)
        return "unmatched-echo-token";
      pendings.splice(index, 1);
    } else if (!("token" in  event)) {
      return "cannot-parse-event";
    }
    send(recipient, event);
  }
  return {
    receive: function (origin, event) {
      if ("token" in event)
        pendings.push(origin+"/"+event.token);
      var line = origin+"/"+Event.stringify(event);
      if (response) {
        response.end(line);
        response = null;
      } else {
        lines.push(line);
        mock.send();
      }
    },
    onsocket: function (socket) {
      if (!Array.isArray(mock))
        return socket.close(4000, "already-connected");
      mock.forEach(socket.send.bind(socket));
      mock = socket;
      socket.on("close", function (code, reason) {
        for (var i=0; i<pendings.length; i++) {
          var parts = /^([^/]*)\/(.*)$/.exec(pendings[i]);
          send(parts[1], {
            echo: parts[2],
            error: "connection-lost",
            data: [code, reason]
          });
        }
      });
      socket.on("message", function (message) {
        var error = onemit(message);
        if (error) {
          socket.close(4000, error);
        }
      });
    },
    onrequest: function (action, body, res) {
      if (action === "emit") {
        var error = onemit(body);
        if (error) {
          res.writeHead(400);
          res.end(error);
        }
        res.end();
      } else if (action === "wait" && !lines.length) {
        response = res;
      } else if (action === "wait" || action === "pull") {
        res.end(lines.join("\n"));
        lines = [];
      } else {
        res.writeHead(400, "unknown-action");
        res.end();
      }
    }
  };
};
