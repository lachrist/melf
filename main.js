
const Events = require("events");
const Agent = require("./agent.js");
const MeteorFormat = require("./meteor-format.js");

const max = parseInt("zzzz", 36);

function rcall (recipient, name, data, callback) {
  if (callback)
    return this._rcall(recipient, name, data, callback);
  let pending = true;
  let result = null;
  this._rcall(recipient, name, data, (error, data) => {
    if (error)
      throw error;
    pending = false;
    result = data;
  });
  while (pending) {
    let res = this._emitter.request("GET", this._login+"/"+this._expect.toString(36), {}, null);
    if (res[0] || res[1] !== 200)
      throw res[0] || new Error(res[1]+" ("+res[2]+")");
    if (res[4] !== "") {
      res[4].split("\n").forEach(this._online);
    }
  }
  return result;
}

function close (code, reason) {
  this._con.close(code, reason);
}

module.exports = (options, callback) => {
  const login = "/"+options.alias+"/"+options.key;
  const con = options.emitter.connect(login);
  con.on("error", callback);
  con.on("open", () => {
    con.removeAllListeners("error");
    con.on("message", (message) => {
      const index = message.indexOf("/");
      if (melf._expect === parseInt(message.substring(0, index), 36)) {
        melf._online(message.substring(index+1));
      }
    });
    con.on("error", (error) => {
      melf.emit("error", error);
    });
    con.on("close", (code, reason) => {
      melf.emit("close", code, reason);
    });
    const mformat = MeteorFormat(options.format);
    const melf = new Events();
    Object.assign(melf, Agent((recipient, message) => {
      con.send(recipient+"/"+mformat.stringify(message));
    }));
    melf._receive = melf.receive;
    melf._rcall = melf.rcall;
    melf._expect = 0;
    melf._con = con;
    melf._emitter = options.emitter;
    melf._login = login;
    melf._online = (line) => {
      melf._expect++;
      if (melf._expect > max)
        melf._expect = 0;
      const index = line.indexOf("/");
      melf._receive(line.substring(0, index), mformat.parse(line.substring(index+1)));
    };
    melf.alias = options.alias;
    melf.close = close;
    melf.rcall = rcall;
    delete melf.receive;
    callback(null, melf);
  });
};
