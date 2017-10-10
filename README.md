# melf <img src="melf-scroll.png" align="right" alt="melf-logo" title="Melf's Minute Meteors"/>

(A)Synchronous remote procedure invocations for JavaScript processes.
To avoid deadlocks, synchronous remote calls can be interleaved (only) by registered remote procedures.
Usage [here](/demo), live demo [here](https://cdn.rawgit.com/lachrist/melf/7df19b6d/demo/index.html).

## `receptor = require("melf/receptor")(keys, onopen)`

* `keys :: {string|null}`
* `onopen(alias, socket)`
  * `alias :: string`
  * `socket :: ws.WebSocket`
* `receptor :: antena.ReceptorServer`

## `receptor = require("melf/receptor/worker")(keys, onopen)`

* `keys :: {string|null}`
* `onopen(alias, socket)`
  * `alias :: string`
  * `socket :: ws.WebSocket`
* `receptor :: antena.ReceptorWorker`

## `require("melf")(options, callback)`

* `options :: object`
  * `emitter :: antena.Emitter`
  * `alias :: string`
  * `key :: string`
  * `format :: object`
    * `data = format.parse(message)`
      * `message :: string`
      * `data :: *`
    * `message = format.stringify(data)`
      * `data :: *`
      * `message :: string`
  * `callback(error, melf)`
    * `error :: Error`
    * `melf :: melf.Melf`

## `Melf :: events.EventEmitter`

* `melf.alias :: string`
* `melf.rprocedures :: {RProcedure}`
* `melf.rcall(recipient, name, data, callback)`
  * `recipient :: string`
  * `name :: string`
  * `data :: *`
  * `callback(error, data)`
    * `error :: Error`
    * `data :: *`
* `data2 = melf.rcall(recipient, name, data1)`
  * `recipient :: string`
  * `name :: string`
  * `data1 :: *`
  * `data2 :: *`
* `melf.close(code, reason)`
  * `code :: number`
  * `reason :: string`
* Event `error`
  * `error :: Error`
* Event `close`
  * `code :: number`
  * `reason :: string`

## `RProcedure(origin, data, callback)`

* `origin :: string`
* `data :: *`
* `callback(error, data)`
  * `error :: Error | *`
  * `data :: *`
