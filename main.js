
const AntenaEmitter = require("antena/emitter");

const max = parseInt("zzzzzz", 36);

function onmessage (message) {
  this._melf._process_meteor(message);
};

function _async_rpcall (recipient, name, data, callback) {
  this._counter++;
  if (this._counter === max)
    this._counter = 1;
  const token = this._counter.toString(36);
  this._callbacks[token] = callback;
  this._emitter.send(recipient+"/"+this.alias+"#"+token+"/"+JSON.stringify([name, data]));
}

const localize = (alias) => (line) => line.startsWith("    at ") ?
  "    " + alias + " " + line.substring(4) :
  line;

function _process_meteor (meteor) {
  const head = meteor.substring(0, meteor.indexOf("/"));
  const index = this._done.indexOf(head);
  if (index === -1) {
    this._done.push(head);
    const prefix = head.substring(0, head.indexOf("#"));
    const token = head.substring(prefix.length+1);
    const body = JSON.parse(meteor.substring(head.length+1));
    if (prefix === "$" || prefix === "!" || prefix === "*") {
      let error, result;
      if (prefix === "$") {
        result = body;
      } else if (prefix === "!") {
        error = new Error(body[1]);
        error.name = body[0];
        error.stack = body[0]+": "+body[1]+"\n"+body[2].join("\n");
      } else {
        error = body;
      }
      this._callbacks[token](error, result);
      delete this._callbacks[token];
    } else {
      const callback = (error, result) => {
        let data, kind;
        if (error instanceof Error) {
          kind = "!";
          data = [
            error.name,
            error.message,
            error
              .stack
              .substring(error.name.length + 2 + error.message.length + 1)
              .split("\n")
              .map(localize(this.alias))
          ];
        } else if (error) {
          kind = "*";
          data = error;
        } else {
          kind = "$";
          data = result;
        }
        this._emitter.send(prefix+"/"+kind+"#"+token+"/"+JSON.stringify(data));
      };
      if (body[0] in this.rprocedures) {
        this.rprocedures[body[0]](prefix, body[1], callback);
      } else {
        callback(new Error("procedure not found: "+body[0]));
      }
    }
  } else {
    this._done.splice(index, 1);
  }
}

function rpcall (recipient, name, data, callback) {
  if (callback)
    return this._async_rpcall(recipient, name, data, callback);
  let pending = true;
  let result = null;
  this._async_rpcall(recipient, name, data, (error, data) => {
    if (error) {
      error.stack = (
        error.name + ": " +
        error.message + "\n" +
        (new Error("foo")).stack.substring("Error: foo\n".length).split("\n").map(localize(this.alias)).join("\n") + "\n" +
        error.stack.substring(error.name.length+2+error.message.length+1));
      throw error;
    }
    pending = false;
    result = data;
  });
  while (pending) {
    const meteors = this._emitter.request("").split("\n");
    for (let index = 0, length=meteors.length; index<length; index++) {
      this._process_meteor(meteors[index]);
    }
  }
  return result;
}

module.exports = (address, alias) => {
  const melf = {
    _callbacks: Object.create(null),
    _async_rpcall: _async_rpcall,
    _counter: 0,
    _process_meteor: _process_meteor,
    _done: [],
    _emitter: AntenaEmitter(address, alias),
    rpcall: rpcall,
    rprocedures: Object.create(null),
    alias: alias
  }
  melf._emitter._melf = melf;
  melf._emitter.onmessage = onmessage;
  return melf;
};
