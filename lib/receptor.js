
const AntenaReceptor = require("antena/lib/receptor");

const default_logger = (origin, recipient, meteor) => {
  console.log(origin+" >> "+recipient+": "+meteor);
};

module.exports = (logger) => {
  const receptor = AntenaReceptor();
  receptor._melf_pendings = {__proto__:null};
  if (logger)
    receptor._melf_logger = typeof logger === "function" ? logger : default_logger;
  receptor._melf_callbacks = {__proto__:null};
  receptor.onpost = onpost;
  receptor.onpull = onpull;
  return receptor;
};

function onpost (origin, message) {
  const recipient = message.substring(0, message.indexOf("/"));
  const meteor = message.substring(recipient.length + 1);
  if ("_melf_logger" in this)
    this._melf_logger(origin, recipient, meteor);
  this.push(recipient, meteor);
  if (this._melf_callbacks[recipient]) {
    this._melf_callbacks[recipient](meteor);
    this._melf_callbacks[recipient] = null;
  } else {
    if (!(recipient in this._melf_pendings))
      this._melf_pendings[recipient] = [];
    this._melf_pendings[recipient].push(meteor);
  }
}

function onpull (session, message, callback) {
  if (message)
    this.onpost(session, message);
  if (this._melf_pendings[session] && this._melf_pendings[session].length) {
    callback(this._melf_pendings[session].join("\n"));
    this._melf_pendings[session].length = 0;
  } else {
    this._melf_callbacks[session] = callback;
  }
}
