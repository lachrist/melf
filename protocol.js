
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
      var parts = /^([^\/]+)\/([0-9]+)\/([^\/]+)\/([\s\S]*)$/.exec(msg);
      if (parts && parts[3] in handlers)
        return handlers[parts[3]](parts[1], parts[4], function (data) {
          box.send(parts[1], parts[2]+"/"+data);
        });
      var parts = /^([0-9]+)\/([\s\S]*)$/.exec(msg);
      if (parts && parts[1] in kontinuations)
        return kontinuations[parts[1]](parts[2]);
      throw new Error("Cannot handle line: "+line);
    });
  }
  function loop () {
    pull(0);
    setTimeout(loop, wait);
  }
  loop();
  if ("process" in global)
    process.on("SIGINT", function () {
      console.log("Stop pulling");
      loop = function () {};
    });
  return {
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
