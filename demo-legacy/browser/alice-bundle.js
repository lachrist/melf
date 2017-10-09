(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var Events = require("events");

function send (message) {
  this._inner_.send(message);
}

function close (code, reason) {
  this._inner_.close(code, reason);
}

module.exports = function (host, secure, prefix) {
  return function (path) {
    var wrapper = new Events();
    wrapper.close = close;
    wrapper.send = send;
    var inner = new WebSocket("ws"+secure+"://"+host+prefix+path);
    Object.defineProperty(wrapper, "_inner_", {value:inner});
    inner.onopen = function () {
      wrapper.emit("open");
    };
    inner.onclose = function (event) {
      wrapper.emit("close", event.code, event.reason);
    };
    inner.onmessage = function (event) {
      wrapper.emit("message", event.data);
    };
    return wrapper;
  };
};

},{"events":9}],2:[function(require,module,exports){

var Connect = require("./connect.js");
var Request = require("./request.js");

module.exports = function (host, secure, splitter) {
  host = host || location.host;
  secure = (location.origin.indexOf("https://") === 0 || secure) ? "s" : "";
  prefix = splitter ? "/"+splitter : "";
    return {
    connect: Connect(host, secure, prefix),
    request: Request(host, secure, prefix)
  };
};

},{"./connect.js":1,"./request.js":3}],3:[function(require,module,exports){

var ParseHeaders = require("../../common/parse-headers.js");

module.exports = function (host, secure, prefix) {
  return function (method, path, headers, body, callback) {
    var req = new XMLHttpRequest();
    req.open(method, "http"+secure+"://"+host+prefix+path, Boolean(callback));
    for (var name in headers)
      req.setRequestHeader(name, headers[name]);
    req.send(body);
    if (!callback) {
      var headers = ParseHeaders(req.getAllResponseHeaders().split("\r\n"));
      return [req.status, req.statusText, headers, req.responseText];
    }
    req.addEventListener("error", callback);
    req.addEventListener("load", function () {
      var headers = ParseHeaders(req.getAllResponseHeaders().split("\r\n"));
      callback(null, req.status, req.statusText, headers, req.responseText);
    });
  };
};

},{"../../common/parse-headers.js":4}],4:[function(require,module,exports){

module.exports = function (lines) {
  var headers = {};
  for (var i=1, l=lines.length; i<l; i++) {
    var index = lines[i].indexOf(": ");
    if (index !== -1) {
      headers[lines[i].substring(0, index).toLowerCase()] = lines[i].substring(index+2);
    }
  }
  return headers;
};

},{}],5:[function(require,module,exports){
var YO = 0;

module.exports = function (format, post) {
  var handlers = {};
  var callbacks = {};
  return {
    receive: function (name, handler) {
      if (typeof handler === "function")
        return handlers[name] = handler;
      if (!handler)
        return delete handlers[name];
      throw new Error("Handler is not a function: "+handler);
    },
    send: function (recipient, name, data, callback) {   
      do {
        var token = Math.random().toString(36).substring(2, 10);
      } while (token in callbacks);
      callbacks[token] = callback;
      post(recipient, {
        token: token,
        name: name,
        data: format.stringify(data)
      });
    },
    push: function (origin, message) {
      if ("token" in message && "name" in message) {
        if (message.name in handlers) {
          handlers[message.name](origin, format.parse(message.data), function (error, data) {
            post(origin, {
              echo: message.token,
              error: error,
              data: format.stringify(data)
            });
          });
        } else {
          post(origin, {
            echo: message.token,
            error: "method-not-found"
          });
        }
      } else if (message.echo in callbacks) {
        var callback = callbacks[message.echo];
        delete callbacks[message.echo];
        callback(message.error, format.parse(message.data));
      }
    }
  }
};

},{}],6:[function(require,module,exports){

var Actor = require("./actor.js");
var Message = require("./message.js");
var Counter = require("./counter.js");

function nil () {}

module.exports = function (options, callback) {
  var expect = 0;
  function online (line) {
    expect = expect === Counter.max ? 0 : expect+1;
    var index = line.indexOf("/");
    actor.push(line.substring(0, index), Message.parse(line.substring(index+1)));
  }
  var con = options.channel.connect("/"+options.alias+"/"+options.key);
  con.on("message", function (message) {
    var index = message.indexOf("/");
    if (expect === parseInt(message.substring(0, index), Counter.radix)) {
      online(message.substring(index+1));
    }
  });
  var actor = Actor(options.format||JSON, function (recipient, event) {
    con.send(recipient+"/"+Message.stringify(event));
  });
  con.on("open", function () {
    if (options.ondisconnect)
      con.on("close", options.ondisconnect);
    callback({
      disconnect: con.close.bind(con),
      receive: actor.receive,
      send: function (recipient, name, data, callback) {
        if (callback)
          return actor.send(recipient, name, data, callback);
        var pending = true;
        var result = null;
        actor.send(recipient, name, data, function (error, data) {
          if (error)
            throw error;
          pending = false;
          result = data;
        });
        while (pending) {
          var path = "/"+options.alias+"/"+options.key+"/"+expect.toString(Counter.radix);
          var res = options.channel.request("GET", path, {}, null);
          if (res[0] !== 200 && res[0] !== 100)
            throw new Error(res[0]+" ("+res[1]+")");
          res[3].split("\n").forEach(online);
        }
        return result;
      }
    });
  });
};

},{"./actor.js":5,"./counter.js":7,"./message.js":8}],7:[function(require,module,exports){

exports.max = parseInt("zzzz", 36);
exports.radix = 36

},{}],8:[function(require,module,exports){

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

},{}],9:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],10:[function(require,module,exports){
var Melf = require("melf");
module.exports = function (channel) {
  Melf({alias:"alice", key:"foo", channel:channel}, function (melf) {
    melf.receive("name", function (origin, data, callback) {
      callback(null, "coltrane");
    });
    var greeting = melf.send("bob", "greeting", null);
    console.log(greeting);
    melf.disconnect(1000, "done");
  });
};
},{"melf":6}],11:[function(require,module,exports){
var ClientChannel = require("channel-cross-platform/client/browser");
var Alice = require("../alice.js");
Alice(ClientChannel(null, false, "foobar"));
},{"../alice.js":10,"channel-cross-platform/client/browser":2}]},{},[11]);
