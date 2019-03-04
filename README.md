# Melf <img src="melf.png" align="right" alt="melf-logo" title="Melf's Minute Meteors"/>

[npm module](https://www.npmjs.com/package/melf) to perform (a)synchronous remote procedure calls for JavaScript processes.
Synchronous remote procedure calls can be interleaved (only) by locally declared remote procedures without deadlocks.

## Client API

### `require("melf")(address, alias, callback)`

* `address :: string | object | melf.Receptor`
* `alias :: string`
* `callback(error, melf)`
  * `error :: Error | null`
  * `melf :: melf.Melf`

### `output = melf.rpcall(recipient, rpname, input)`

* `recipient :: string`
* `rpname :: string`
* `input :: JSON`
* `output :: JSON`

### `melf.rpcall(recipient, rpname, input, (error, output) => {...})`

* `recipient :: string`
* `rpname :: string`
* `input :: JSON`
* `error :: Error | null`
* `output :: JSON`

### `melf.rprocedures[rpname] = (origin, input, callback) => {...}`

* `rpname :: string`
* `origin :: string`
* `input :: JSON`
* `callback(error, output)`
  * `error :: Error | null`
  * `output :: JSON`

### `melf.terminate((error) => { ... })`

* `error :: Error | null`

### `melf.destroy()`

## Server API

If Melf is installed globally, a Melf server can be launched with:

```txt
> melf --port 8080
Listening on { address: '::', family: 'IPv6', port: 8080 }
```

### `receptor = require("melf/receptor")([logger])`

* `receptor :: antena.Receptor`
* `logger(origin, recipient, meteor)`
  * `origin :: string` 
  * `recipient :: string`
  * `meteor :: string`
