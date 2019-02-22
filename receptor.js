
const AntenaReceptor = require("antena/receptor");

const default_logger = (origin, recipient, meteor) => {
  console.log(origin+" >> "+recipient+": "+meteor);
};

module.exports = (logger) => {
  const receptor = AntenaReceptor();
  receptor._melf_pendings = Object.create(null);
  if (logger)
    receptor._melf_logger = typeof logger === "function" ? logger : default_logger;
  receptor._melf_callbacks = Object.create(null);
  receptor.onmessage = onmessage;
  receptor.onrequest = onrequest;
  return receptor;
};

function onmessage (origin, message) {
  const index = message.indexOf("/");
  const recipient = message.substring(0, index);
  const meteor = message.substring(index+1);
  if ("_melf_logger" in this)
    this._melf_logger(origin, recipient, meteor);
  this.send(recipient, meteor);
  if (this._melf_callbacks[recipient]) {
    this._melf_callbacks[recipient](meteor);
    this._melf_callbacks[recipient] = null;
  } else {
    if (!(recipient in this._melf_pendings))
      this._melf_pendings[recipient] = [];
    this._melf_pendings[recipient].push(meteor);
  }
}

function onrequest (origin, request, callback) {
  if (this._melf_pendings[origin] && this._melf_pendings[origin].length) {
    callback(this._melf_pendings[origin].join("\n"));
    this._melf_pendings[origin].length = 0;
  } else {
    this._melf_callbacks[origin] = callback;
  }
}
