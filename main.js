const SplitIn = require("./split-in.js");

const max = parseInt("zzzzzzzz", 36);

const noop = () => {};

const onmessage = (event) => {
  event.target._melf._process_meteor(event.data);
};

const onerror = (event) => {
  (event.target._melf.onerror||noop)(event);
};

const onclose = (event) => {
  (event.target._melf.onclose||noop)(event);
};

const remote_procedure_not_found = (origin, input, callback) => {
  callback(new Error("Remote procedure not found"));
};

function _async_rpcall (recipient, name, data, callback) {
  this._counter++;
  if (this._counter === max)
    this._counter = 0;
  const token = this._counter.toString(36);
  this._callbacks[token] = callback;
  this._websocket.send(recipient+"/"+this.alias+"/"+token+"/"+name+"/"+JSON.stringify(data === void 0 ? null : data));
}

function _process_meteor (meteor) {
  if (meteor[0] === "/") {
    const [,echo, hint, output] = SplitIn(meteor, "/", 4);
    const index = this._done.indexOf(echo);
    if (index === -1) {
      this._done.push(echo);
      if (echo in this._callbacks) {
        callback = this._callbacks[echo];
        delete this._callbacks[echo];
        if (hint === "s") {
          callback(null, JSON.parse(output));
        } else if (hint === "f") {
          callback(JSON.parse(output));
        } else if (hint === "e") {
          const [message, stack] = JSON.parse(output);
          const error = new Error(message);
          error.stack = stack;
          callback(error);
        } else {
          console.warn("Illegal hint: "+hint);
        }
      } else {
        console.warn("Unmatched echo: "+echo);
      }
    } else {
      this._done.splice(index, 1);
    }
  } else {
    const [origin, token, name, input] = SplitIn(meteor, "/", 4);
    const index = this._done.indexOf(origin+"/"+token);
    if (index === -1) {
      this._done.push(origin+"/"+token);
      const self = this;
      (this.rprocedures[name]||remote_procedure_not_found)(origin, JSON.parse(input), (error, data) => {
        if (error) {
          if (error instanceof Error) {
            self._websocket.send(origin+"//"+token+"/e/"+JSON.stringify([error.message, error.stack]));
          } else {
            self._websocket.send(origin+"//"+token+"/f/"+JSON.stringify(error));
          }
        } else {
          self._websocket.send(origin+"//"+token+"/s/"+JSON.stringify(data));
        }
      });
    } else {
      this._done.splice(index, 1);
    }
  }
}

function rpcall (recipient, name, data, callback) {
  if (callback)
    return this._async_rpcall(recipient, name, data, callback);
  let pending = true;
  let result = null;
  this._async_rpcall(recipient, name, data, (error, data) => {
    if (error)
      throw error;
    pending = false;
    result = data;
  });
  while (pending) {
    const [status, message, headers, body] = this._antena.request("GET", "/"+this.alias, {}, null);
    if (status !== 200)
      throw new Error(status+" ("+message+")");
    if (body === "")
      throw new Error("Empty pull body");
    const meteors = body.split("\n");
    for (let index = 0, length=meteors.length; index<length; index++) {
      this._process_meteor(meteors[index]);
    }
  }
  return result;
}

module.exports = (antena, alias, callback) => {
  const websocket = antena.WebSocket("/"+alias);
  websocket.onerror = (event) => { callback(new Error(event.message || "Could not connect to: "+event.target.URL)) };
  websocket.onmessage = (event) => {
    websocket.onmessage = onmessage;
    websocket.onerror = onerror;
    websocket.onclose = onclose;
    websocket._melf = {
      rpcall: rpcall,
      rprocedures: Object.create(null),
      alias: event.data,
      _websocket: websocket,
      _callbacks: Object.create(null),
      _async_rpcall: _async_rpcall,
      _counter: 0,
      _process_meteor: _process_meteor,
      _done: [],
      _antena: antena
    };
    callback(null, websocket._melf);
  };
};
