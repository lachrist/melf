
var Event = require("../event.js");

function remove (xs, x) {
  var i = xs.indexOf(x);
  if (i !== -1)
    xs.splice(i, 1);
  return i !== -1;
}

module.exports = function (distribute, onclose) {
  var mock = [];
  mock.send = mock.push;
  var response = null;
  var lines = [];
  var pendings = [];
  function process (channel, line) {
    var parts = /^([^/]*)\/(.*)$/.exec(line);
    if (!parts)
      return "cannot-parse-recipient";
    var recipient = parts[1];
    var event = Event.parse(parts[2]);
    if ("echo" in event) {
      if (!remove(pendings, channel+"/"+recipient+"/"+event.echo)) {
        return "unmatched-echo-token";
      }
    } else if (!("token" in  event)) {
      return "cannot-parse-event";
    }
    distribute(channel, recipient, event);
  }
  return {
    receive: function (channel, origin, event) {
      if ("token" in event)
        pendings.push(channel+"/"+origin+"/"+event.token);
      var line = origin+"/"+Event.stringify(event);
      if (channel === "@")
        return mock.send(line);
      if (response) {
        response.end(line);
        response = null;
      } else {
        lines.push(line);
        mock.send("ping");
      }
    },
    onsocket: function (socket) {
      if (Array.isArray(mock)) {
        mock.forEach(socket.send.bind(socket));
        mock = socket;
        mock.onclose = function (code, reason) {
          for (var i=0; i<pendings.length; i++) {
            var parts = /^([^/]*)\/([^/]*)\/(.*)$/.exec(pendings[i]);
            distribute(parts[1], parts[2], {
              echo: parts[3],
              error: "connection-lost",
              data: null
            });
          }
          onclose(code, reason);
        };
        mock.onmessage = function (message) {
          var error = process("@", message.data);
          if (error) {
            mock.close(4000, error);
          }
        };
      } else {
        mock.close(4000, "already-connected");
      }
    },
    onrequest: function (action, req, res) {
      if (action === "emit") {
        var line = "";
        req.on("data", function (data) { line += data });
        req.on("end", function () {
          var error = process("$", line);
          if (error) {
            res.writeHead(400);
            res.end(error);
          }
          res.end();
        });
      } else if (action === "wait" && !lines.length) {
        response = res;
      } else if (action === "wait" || action === "pull") {
        res.end(lines.join("\n"));
        lines = [];
      } else {
        res.writeHead(400);
        res.end("action-not-found");
      }
    }
  };
};
