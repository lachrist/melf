
const MeteorError = require("./meteor-error.js");
const MeteorGetToken = require("./meteor-get-token.js");

module.exports = (remotes, alias) => {
  return (recipient, mstring) => {
    if (recipient in remotes)
      return remotes[recipient].push(alias, mstring);
    const token = MeteorGetToken(mstring);
    if (token && alias in remotes) {
      remotes[alias].push(alias, MeteorError(token, "Recipient not found: "+recipient));
    }
  };
};
