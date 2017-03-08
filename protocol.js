
module.exports = function (box, alias, wait) {
  var counter = 0;
  var kontinuations = {};
  var handlers = {};
  function register (event, handler) {
    if (event in handlers)
      throw new Error("Handler for "+event+" is alreayd defined");
    handlers[event] = handler;
  }
  function trigger (recipient, event, data, kontinuation) {
    var id = counter++;
    kontinuations[id] = kontinuation;
    box.send(recipient, alias+"/"+id+"/"+event+"/"+data);
  }
  function pull (wait) {
    box.pull(wait).forEach(function (line) {
      var parts = /^([^\/]+)\/([0-9]+)\/([^\/]+)\/([\s\S]*)$/.exec(line);
      if (parts) {
        if (parts[3] in  handlers) {
          return handlers[parts[3]](parts[1], parts[4], function (data) {
            box.send(parts[1], parts[2]+"/"+data);
          });
        }
        throw new Error("No handler for "+parts[3]+" from: "+line);
      }
      var parts = /^([0-9]+)\/([\s\S]*)$/.exec(line);
      if (parts) {
        if (parts[1] in kontinuations) {
          var kontinuation = kontinuations[parts[1]];
          delete kontinuations[parts[1]];
          return kontinuation(parts[2]);
        }
        throw new Error("No kontinuations for "+parts[1]+" from: "+line);
      }
      throw new Error("Cannot handle line: "+line);
    });
  }
  function loop () {
    pull(0);
    setTimeout(loop, wait);
  }
  // No immediate pulling to let
  // time for installing handlers
  setTimeout(loop, wait);
  return {
    close: function () {
      loop = function () {};
    },
    alias: alias,
    async: {
      register: register,
      trigger: trigger
    },
    sync: {
      register: function (event, handler) {
        register(event, function (origin, data, repply) {
          repply(handler(origin, data));
        });
      },
      trigger: function (recipient, event, data) {
        var result = null;
        trigger(recipient, event, data, function (str) {
          result = str;
        });
        while(result === null)
          pull(wait);
        return result;
      }
    }
  };
};
