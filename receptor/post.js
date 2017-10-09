
module.exports = function (remotes, alias) {
  return function (recipient, message) {
    if (recipient in remotes)
      return remotes[recipient].push(alias, message);
    if ("token" in message && alias in remotes) {
      remotes[alias].push(alias, {
        echo: message.token,
        error: "recipient-not-found"
      });
    }
  };
};
