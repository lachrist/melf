
const AntenaReceptor = require("antena/lib/receptor");

const default_logger = (origin, recipient, meteor) => {
  console.log(origin+" >> "+recipient+": "+meteor);
};

module.exports = (logger) => {
  const receptor = AntenaReceptor();
  const distributor = {
    _receptor: receptor,
    _pendings: {__proto__:null},
    _callbacks: {__proto__:null},
    _logger: typeof logger === "function" ? logger : (logger && default_logger),
    ConnectionListener,
    RequestMiddleware,
    UpgradeMiddleware
  };
  receptor.onpost = onpost;
  receptor.onpull = onpull;
  receptor._melf = distributor;
  return distributor;
};

function ConnectionListener () {
  return this._receptor.ConnectionListener();
}

function RequestMiddleware (splitter) {
  return this._receptor.RequestMiddleware(splitter);
}

function UpgradeMiddleware (splitter) {
  return this._receptor.UpgradeMiddleware(splitter);
}

function onpost (origin, message) {
  const recipient = message.substring(0, message.indexOf("/"));
  const meteor = message.substring(recipient.length + 1);
  if (this._melf._logger)
    this._melf._logger(origin, recipient, meteor);
  this.push(recipient, meteor);
  if (this._melf._callbacks[recipient]) {
    this._melf._callbacks[recipient](meteor);
    this._melf._callbacks[recipient] = null;
  } else {
    if (!(recipient in this._melf._pendings))
      this._melf._pendings[recipient] = [];
    this._melf._pendings[recipient].push(meteor);
  }
}

function onpull (session, message, callback) {
  if (message)
    this.onpost(session, message);
  if (this._melf._pendings[session] && this._melf._pendings[session].length) {
    callback(this._melf._pendings[session].join("\n"));
    this._melf._pendings[session].length = 0;
  } else {
    this._melf._callbacks[session] = callback;
  }
}
