
// ?token/event/data
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
  return  {};
};

exports.stringify = function (event, stringifydata) {
  if ("token" in event && "name" in  event)
    return "?"+event.token+"/"+event.name+"/"+(event.data||"");
  if ("echo" in event)
    return "!"+event.echo+"/"+(event.error||"")+"/"+(event.data||"");
  throw new Error("Cannot write event: "+JSON.stringify(event));
};
