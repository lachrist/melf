# melf <img src="melf.png" align="right" alt="melf-logo" title="Melf's Minute Meteors"/>

(A)Synchronous remote procedure calls for JavaScript processes.
To avoid deadlocks, synchronous remote procedure calls can be interleaved (only) by locally declared remote procedures.

## Client API

### `require("melf")(antena, alias, (error, melf) => {...}))`

* `antena :: antena.Antena`
* `alias :: string`
* `error :: Error`
* `melf :: melf.Melf`

### `output = melf.rpcall(recipient, rpname, input)`

* `recipient :: string`
* `rpname :: string`
* `input :: JSON`
* `output :: JSON`

### `melf.rpcall(recipient, rpname, (error, output) => {...})`

* `recipient :: string`
* `rpname :: string`
* `input :: JSON`
* `error :: Error`
* `output :: JSON`

### `melf.rprocedures[rpname] = (origin, input, callback) => {...}`

* `rpname :: string`
* `origin :: string`
* `input :: JSON`
* `callback(error, output)`
  * `error :: Error`
  * `output :: JSON`

## Server API

If Melf is installed globally, a Melf server can be launched with:
```txt
> melf 8080
Listening on { address: '::', family: 'IPv6', port: 8080 }
```

### `require("melf/server/attach")(server, prefix)`

* `prefix :: string | undefined`
  Only http requests whose path starts with this prefix will be handled
* `server :: http.Server | https.Server`

### `pool = require("melf/server/pool")()`

### `pool.pull(path, response)`

* `path :: string`
  The path of the incoming http request
* `response :: http.ServerResponse`

### `pool.connect(path, websocket)`

* `path :: string`
  The path of the incoming http request which initiate the handshake
* `websocket :: ws.WebSocket`
