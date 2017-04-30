
module.exports = function (format, send) {
  var handlers = {};
  var callbacks = {};
  return {
    register: function (name, handler) { handlers[name] = handler },
    unregister: function (name) { delete handlers[name] },
    receive: function (origin, event) {
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
