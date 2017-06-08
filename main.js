
var Event = require("./event.js");
var Emitter = require("./emitter.js");

// socket send:
//   - melf request           (recipient/?token/name/data)
//   - melf response          (origin/!echo/error/data)
// socket receive:
//   - ping
// HTTP request:
//   - wait until message     GET key/wait
//   - pull immediatly        GET key/pull
// HTTP response:
//   - melf request          (recipient/?token/name/data).join(\n)
//   - melf response         (origin/!echo/error/data).join(\n)

function extract (response) {
  if (response.status !== 200 && response.status !== 100)
    throw new Error(response.status+" ("+response.reason+")");
  return response.body;
}

module.exports = function (options, callback) {
  var con = options.channel.connect("/"+options.private);
  con.onopen = function () {
    var emitter = Emitter(options.format||JSON, function (recipient, event) {
      con.send(recipient+"/"+Event.stringify(event));
    });
    function onbody (body) {
      if (body) {
        var lines = body.split("\n");
        for (var i=0, l=lines.length; i<l; i++) {
          var parts = /^([^/]*)\/(.*)$/.exec(lines[i]);
          var error = emitter.receive(parts[1], Event.parse(parts[2]));
          if (error) {
            console.warn(error+" from "+line[i]);
          }
        }
      }
    }
    (function () {
      var timeout = null;
      function pull () {
        timeout = null;
        onbody(extract(options.client.http("GET", "/"+options.private+"/pull/", {}, null)));
      }
      con.onmessage = function () {
        timeout = timeout || setTimeout(pull, 0);
      };
    } ());
    callback({
      on: emitter.on,
      emit: function (recipient, name, data, callback) {
        if (callback)
          return emitter.emit(recipient, name, data, callback);
        var pending = true;
        var result = null;
        emitter.emit(recipient, name, data, function (error, data) {
          if (error)
            throw error;
          pending = false;
          result = data;
        });
        while (pending)
          onbody(extract(options.client.http("GET", "/"+options.splitter+"/wait/"+key, {}, null)));
        return result;
      }
    });
  };
}

// module.exports = function (options, callback) {
//   if (!callback) {
//     return make(options, extract(options.client.http("GET", "/"+options.splitter+"/auth/"+options.alias, {}, null)), function (error) {
//       if (error) {
//         throw error;
//       }
//     });
//   }
//   options.client.http("GET", "/"+options.splitter+"/auth/"+options.alias, {}, null, function (error, response) {
//     if (error)
//       return callback(error);
//     try {
//       var body = extract(response);
//     } catch (error) {
//       return callback(error);
//     }
//     make(options, body, callback);
//   });
// };

// function make (options, body, callback) {
//   var alias = body.split("/")[0];
//   var key = body.split("/")[1];
//   var emitter = Emitter(options.format||JSON, function (recipient, event) {
//     mock.send(recipient+"/"+Event.stringify(event));
//   });
//   var mock = {
//     send: function (message) {
//       options.client.http("POST", "/"+options.splitter+"/emit/"+key, {}, message, true);
//     }
//   };
//   (function () {
//     var timeout = null;
//     function pull () {
//       timeout = null;
//       onbody(extract(options.client.http("GET", "/"+options.splitter+"/pull/"+key, {}, null)));
//     }
//     var socket = options.client.ws("/"+options.splitter+"/"+key);
//     socket.onmessage = function () {
//       timeout = timeout || setTimeout(pull, 0);
//     };
//     socket.onerror = function (error) {
//       callback(error);
//     }
//     socket.onopen = function () {
//       mock = socket;
//       delete socket.onerror;
//       callback(null, interface);
//     };
//   } ());
//   function onbody (body) {
//     if (body) {
//       var lines = body.split("\n");
//       for (var i=0, l=lines.length; i<l; i++) {
//         var parts = /^([^/]*)\/(.*)$/.exec(lines[i]);
//         var error = emitter.receive(parts[1], Event.parse(parts[2]));
//         if (error) {
//           console.warn(error+" from "+line[i]);
//         }
//       }
//     }
//   }
//   var interface = {
//     alias: alias,
//     on: emitter.on,
//     emit: function (recipient, name, data, callback) {
//       if (callback)
//         return emitter.emit(recipient, name, data, callback);
//       var pending = true;
//       var result = null;
//       emitter.emit(recipient, name, data, function (error, data) {
//         if (error)
//           throw error;
//         pending = false;
//         result = data;
//       });
//       while (pending)
//         onbody(extract(options.client.http("GET", "/"+options.splitter+"/wait/"+key, {}, null)));
//       return result;
//     }
//   };
//   return interface;
// }
