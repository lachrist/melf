
function log (debug, send) {
  return function (recipient, event) {
    console.log(pad(debug, 5)+" >> "+pad(recipient, 5)+": "+JSON.stringify(event));
    return send(recipient, event);
  }
}

function pad (string, size) {
  if (string.length >= size)
    return string.substring(0, size);
  while (string.length < size)
    string += " ";
  return string
}

module.exports = function (debug, format, send) {
  send = debug ? log(debug, send) : send;
  format = format || {
    parse: function (x) { return x },
    stringify: function (x) { return x }
  };
  var handlers = {};
  var callbacks = {};
  return {
    register: function (name, handler) { handlers[name] = handler },
    unregister: function (name) { delete handlers[name] },
    receive: function (origin, event) {
      if (debug)
        console.log(pad(debug, 5)+" << "+pad(origin, 5)+": "+JSON.stringify(event));
      if ("token" in event && "name" in event) {
        if (event.name in handlers) {
          handlers[event.name](origin, format.parse(event.data), function (error, data) {
            send(origin, {
              echo: event.token,
              error: error,
              data: format.stringify(data)
            });
          });
        } else {
          send(origin, {
            echo: event.token,
            error: "event-not-found"
          });
        }
      } else if ("echo" in event) {
        if (event.echo in callbacks) {
          var callback = callbacks[event.echo];
          delete callbacks[event.echo];
          callback(event.error, format.parse(event.data));
        } else {
          return "token-not-found";
        }
      } else {
        return "parse-error";
      }
    },
    emit: function (recipient, name, data, callback) {
      var token = Math.random().toString(36).substring(2);
      while (token in callbacks)
        token = Math.random().toString(36).substring(2);
      callbacks[token] = callback;
      send(recipient, {
        token: token,
        name: name,
        data: format.stringify(data)
      });
    }
  }
};
