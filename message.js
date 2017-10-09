
// ?token/name/data
// !echo/error/data

exports.parse = function parse (string) {
  var parts = /^([^/]*)\/([^/]*)\/(.*)$/.exec(string);
  if (parts && string[0] === "?") {
    return {
      token: parts[1].substring(1),
      name: parts[2],
      data: parts[3] || null
    };
  }
  if (parts && string[0] === "!") {
    return {
      echo: parts[1].substring(1),
      error: parts[2] || null,
      data: parts[3] || null
    };
  }
};

exports.stringify = function (message) {
  if ("token" in message && "name" in message)
    return "?"+message.token+"/"+message.name+"/"+(message.data||"");
  if ("echo" in message)
    return "!"+message.echo+"/"+(message.error||"")+"/"+(message.data||"");
  throw new Error("Cannot write message: "+JSON.stringify(message));
};
