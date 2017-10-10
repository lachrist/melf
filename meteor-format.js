
// ?token/name/data
// @echo/data
// !echo/error-message
// |echo/error

module.exports = (format) => {
  return {
    _format: format || JSON,
    parse: parse,
    stringify: stringify
  };
};

function parse (string) {
  if (string[0] === "?") {
    const parts = /^([^/]*)\/([^/]*)\/(.*)$/.exec(string.substring(1));
    if (parts) {
      return {
        token: parts[1],
        name: parts[2],
        data: this._format.parse(parts[3])
      };
    }
  }
  const parts = /^([^/]*)\/(.*)$/.exec(string.substring(1));
  if (parts) {
    if (string[0] === "@") {
      return {
        echo: parts[1],
        data: this._format.parse(parts[2])
      };
    }
    if (string[0] === "!") {
      return {
        echo: parts[1],
        error: new Error(JSON.parse(parts[2]))
      };
    }
    if (string[0] === "|") {
      return {
        echo: parts[1],
        error: this._format.parse(parts[2])
      };
    }
  }
  throw new Error("Cannot parse as meteor: "+string);
};

function stringify (meteor) {
  if ("token" in meteor && "name" in meteor)
    return "?"+meteor.token+"/"+meteor.name+"/"+this._format.stringify(meteor.data);
  if ("echo" in meteor) {
    if (meteor.error instanceof Error)
      return "!"+meteor.echo+"/"+JSON.stringify(meteor.error.message);
    if (meteor.error)
      return "|"+meteor.echo+"/"+this._format.stringify(meteor.error);
    return "@"+meteor.echo+"/"+this._format.stringify(meteor.data);
  }
  throw new Error("Cannot stringify meteor: "+meteor);
};
