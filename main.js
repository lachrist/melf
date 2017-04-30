
var Event = require("./event.js");
var Emitter = require("./emitter.js");
var Channel = require("./channel.js");

// socket send:
//   - asynchronous request   (recipient/?token/name/data)
//   - asynchronous response  (recipient/!echo/error/data)
// socket receive:
//   - asynchronous request   (origin/?token/name/data)
//   - asynchronous response  (origin/!echo/error/data)
//   - ping                   (ping)
//
// HTTP request:
//   - synchronous request    (/sync/key recipient/?token/name/data)
//   - synchronous response   (/sync/alias origin/!echo/error/data)
//   - pull immediatly        (/pull/alias)
//   - wait until message     (/wait/alias)
//   - get a key and an alias (/auth/alias)
// HTTP response:
//   - free alias with key    (alias/key)
//   - synchronous requests   (recipient/?token/name/data).join(\n)
//   - synchronous responses  (origin/!echo/error/data).join(\n)

// options: {
//   request: function,
//   WebSocket: constructor,
//   alias: string,
//   splitter: string,
//   url: string,
//   wsurl: string
// }

function wsurl (url) {
  var index = url.indexOf("//");
  if (index === -1)
    throw new Error("Cannot extract protocol from: "+url);
  var rest = url.substring(index);
  switch (url.substring(0, index)) {
    case "http:":  return "ws:"+rest;
    case "https:": return "wss:"+rest;
    case "unix:":  return "ws+unix:"+rest+":";
    case "unixs:": return "wss+unix:"+rest+":";
  }
  throw new Error("Unknown protocol in: "+url);
}

module.exports = function (options, callback) {
  var channel = Channel(options.request, options.url, options.splitter);
  if (!callback)
    return make(channel, options, channel.sync("/auth/"+options.alias, null));
  channel.async("/auth/"+options.alias, null, make.bind(null, channel, options));
};

function make (channel, options, body) {
  options.format = options.format || JSON
  var alias = body.split("/")[0];
  var key = body.split("/")[1];
  setTimeout(function () {
    var socket = new options.WebSocket(wsurl(options.wsurl||options.url)+"/"+options.splitter+"/"+key);
    socket.onmessage = function (line) {
      if (line.data === "ping")
        return onbody(channel.sync("/pull/"+key, null));
      var parts = /^([^/]*)\/(.*)$/.exec(line.data);
      emitters.async.receive(parts[1], Event.parse(parts[2]));
    };
    socket.onopen = function () {
      mock.forEach(socket.send.bind(null));
      mock = socket;
    };
  }, 0);
  var mock = [];
  mock.send = mock.push;
  var emitters = {
    async: Emitter(options.format, function (recipient, event) {
      mock.send(recipient+"/"+Event.stringify(event));
    }),
    sync: Emitter(options.format, function (recipient, event) {
      channel.sync("/emit/"+key, recipient+"/"+Event.stringify(event));
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
          onbody(channel.sync("/wait/"+key, null));
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

