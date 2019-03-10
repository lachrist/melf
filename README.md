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

### `melf.destroy()`

### `melf.terminate()`

### `melf.onterminate = () => { ... }`

## Server API

### `distributor = require("melf/distributor")(logger)`

* `logger(origin, recipient, meteor) | undefined | boolean`
  * `origin :: string` 
  * `recipient :: string`
  * `meteor :: string`
* `distributor :: melf.Distributor`

### `listener = orchestrator.ConnectionListener()`

* `listener(net.Socket)`

### `middleware = distributor.RequestMiddleware(splitter)`

* `splitter :: string | undefined`
* `handled = middleware(request, response, next)`
  * `request :: http.Request`
  * `response :: http.Response`
  * `next()`
  * `handled :: boolean`

### `middleware = distributor.UpgradeMiddleware(splitter)`

* `splitter :: string | undefined`
* `handled = middleware(request, socket, head, next)`
  * `request :: http.Request`
  * `socket :: net.Socket`
  * `head :: Buffer`
  * `next()`
  * `handled :: boolean`
