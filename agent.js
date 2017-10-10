
function rcall (recipient, name, data, callback) {
  do {
    var token = Math.random().toString(36).substring(2, 10);
  } while (token in this._callbacks);
  this._callbacks[token] = callback;
  this._send(recipient, {
    token: token,
    name: name,
    data: data
  });
}

function receive (origin, meteor) {
  if ("token" in meteor && "name" in meteor) {
    if (meteor.name in this.rprocedures) {
      const send = this._send;
      this.rprocedures[meteor.name](origin, meteor.data, (error, data) => {
        send(origin, {
          echo: meteor.token,
          error: error,
          data: data
        });
      });
    } else {
      this._send(origin, {
        echo: meteor.token,
        error: new Error("Remote procedure not found: "+meteor.name)
      });
    }
  } else if (meteor.echo in this._callbacks) {
    const callback = this._callbacks[meteor.echo];
    delete this._callbacks[meteor.echo];
    callback(meteor.error, meteor.data);
  }
}

module.exports = (send) => {
  return {
    _send: send,
    _callbacks: Object.create(null),
    rprocedures: Object.create(null),
    rcall: rcall,
    receive: receive
  };
};
