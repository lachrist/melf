
module.exports = function (format, send) {
  var callbacks = Object.create(null);
  var rprocedures = Object.create(null);
  return {
    rprocedures: rprocedures,
    rcall: function (recipient, name, data, callback) {   
      do {
        var token = Math.random().toString(36).substring(2, 10);
      } while (token in callbacks);
      callbacks[token] = callback;
      send(recipient, {
        token: token,
        name: name,
        data: format.stringify(data)
      });
    },
    receive: function (origin, message) {
      if ("token" in message && "name" in message) {
        if (message.name in rprocedures) {
          rprocedures[message.name](origin, format.parse(message.data), function (error, data) {
            send(origin, {
              echo: message.token,
              error: error,
              data: format.stringify(data)
            });
          });
        } else {
          send(origin, {
            echo: message.token,
            error: "remote-procedure-not-found"
          });
        }
      } else if (message.echo in callbacks) {
        var callback = callbacks[message.echo];
        delete callbacks[message.echo];
        callback(message.error, format.parse(message.data));
      }
    }
  }
};
