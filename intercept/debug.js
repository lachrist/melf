
var EventEmitter = require("events");

var counter = 0;

exports.request = function (req, res) {
  var id = ++counter;
  if (req.method === "GET") {
    process.stdout.write("request#"+id+" >> GET "+req.url+"\n");
  } else {
    var input = "";
    req.on("data", function (data) { input += data });
    req.on("end", function () {
      process.stdout.write("request#"+id+" >> "+req.method+" "+req.url+" >> "+input+"\n");
    });
  }
  var output = " 200 OK ";
  return {
    writeHead: function (status, message, headers) {
      output = status+" "+message+" ";
      return res.writeHead(status, message, headers);
    },
    write: function (chunk, encoding, callback) {
      output += chunk;
      return res.write(chunk, encoding, callback);
    },
    end: function (chunk, encoding, callback) {
      output += chunk;
      process.stdout.write("response#"+id+" >> "+output+"\n");
      return res.end(chunk, encoding, callback);
    }
  };
};

exports.socket = function (socket) {
  process.stdout.write("socket"+socket.upgradeReq.url+" connected\n");
  var mock = new EventEmitter();
  socket.on("message", function (message) {
    process.stdout.write("socket"+socket.upgradeReq.url+" << "+message+"\n");
    mock.emit("message", message);
  });
  socket.on("close", function (code, reason) {
    process.stdout.write("socket"+socket.upgradeReq.url+" disconnected\n");
    mock.emit("close", code, reason);
  });
  mock.upgradeReq = socket.upgradeReq;
  mock.send = function (message) {
    process.stdout.write("socket"+socket.upgradeReq.url+" >> "+message+"\n");
    return socket.send(message);
  };
  mock.close = function (code, reason) {
    return socket.close(code, reason);
  };
  return mock;
}
