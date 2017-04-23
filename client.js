
var Event = require("./event.js");
var Emitter = require("./emitter.js");

// socket send:
//   - asynchronous request   (recipient/?echo/event/data)
//   - asynchronous response  (recipient/!echo/data)
// socket receive:
//   - asynchronous request   (origin/?echo/event/data)
//   - asynchronous response  (origin/!echo/data)
//   - ping                   (ping)
//
// HTTP request:
//   - synchronous request    (/sync/key recipient/?echo/event/data)
//   - synchronous response   (/sync/alias recipient/!echo/data)
//   - pull immediatly        (/pull/alias)
//   - wait until message     (/wait/alias)
//   - obtain a free alias    (/sign/alias)
// HTTP response:
//   - free alias with key    (alias/key)
//   - synchronous requests   (origin/?echo/event/data).join(\n)
//   - synchronous responses  (origin/!echo/data).join(\n)

function assume (results) {
  if (results[0] || results[1] !== 200)
    throw results[0] || new Error(results[1]+": "+results[3]);
  return results[3];
}

function make (alias, key, debug, format, request, socket) {
  var mock = [];
  mock.send = mock.push;
  var emitters = {
    async: Emitter(debug?"@"+alias:null, format, function (recipient, event) { mock.send(recipient+"/"+Event.stringify(event)) }),
    sync: Emitter(debug?"$"+alias:null, format, function (recipient, event) {
      assume(request("POST", "/emit/"+key, {}, recipient+"/"+Event.stringify(event)));
    })
  };
  function onbody (body) {
    if (body) {
      var lines = body.split("\n");
      for (var i=0, l=lines.length; i<l; i++) {
        var parts = /^([^/]*)\/(.*)$/.exec(lines[i]);
        emitters.sync.receive(parts[1], Event.parse(parts[2]));
      }
    }
  }
  socket.onmessage = function (line) {
    if (line.data === "ping")
      return onbody(assume(request("GET", "/pull/"+key, {}, null)));
    var parts = /^([^/]*)\/(.*)$/.exec(line.data);
    emitters.async.receive(parts[1], Event.parse(parts[2]));
  };
  socket.onopen = function () {
    mock.forEach(socket.send.bind(null));
    mock = socket;
  };
  return {
    alias: alias,
    sync: {
      register: emitters.sync.register,
      unregister: emitters.sync.unregister,
      emit: function (recipient, event, data) {
        var pending = true;
        var result = null;
        emitters.sync.emit(recipient, event, data, function (error, data) {
          if (error)
            throw error;
          pending = false;
          result = data;
        });
        while (pending)
          onbody(assume(request("GET", "/wait/"+key, {}, null)));
        return result;
      }
    },
    async: {
      register: emitters.async.register,
      unregister: emitters.async.unregister,
      emit: emitters.async.emit
    }
  };
}

module.exports = function (alias, debug, format, request, Socket, callback) {
  if (!callback) {
    var splits = assume(request("GET", "/auth/"+alias, {}, null)).split("/");
    return make(splits[0], splits[1], debug, format, request, Socket(splits[1]));
  }
  request("GET", "/auth/"+alias, {}, null, function (error, status, headers, body) {
    if (error || status !== 200)
      return callback(error || new Error(status+": "+body));
    var splits = body.split("/");
    callback(null, make(splits[0], splits[1], debug, format, request, Socket(splits[1])));
  });
};
