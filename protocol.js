
module.exports = function (box, wait) {
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
    box.send(recipient, [box.alias, id, event, data]);
  }
  function pull (wait) {
    box.pull(wait).forEach(function (data) {
      if (data.length === 2) {
        if (data[0] in kontinuations) {
          var kontinuation = kontinuations[data[0]];
          delete kontinuations[data[0]];
          return kontinuation(data[1]);
        }
        throw new Error("No kontinuations for "+data[0]+" from: "+JSON.stringify(data));
      }
      if (data.length === 4) {
        if (data[2] in handlers) {
          return handlers[data[2]](data[0], data[3], function (inner) {
            box.send(data[0], [data[1], inner]);
          });
        }
        throw new Error("No handler for "+data[2]+" from: "+JSON.stringify(data));
      }
      throw new Error("Cannot handle data: "+JSON.stringify(data));
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
    alias: box.alias,
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
