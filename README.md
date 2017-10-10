# melf

Pull-based communications for JavaScript processes
Usage [here](/demo), live demo [here](wesh).

## `receptor = require("melf/receptor")(keys, onopen)`

* `keys :: {string}`
* `onopen(alias, socket)`
  * `alias :: string`
  * `socket :: ws.WebSocket`
* `receptor :: antena.ReceptorServer`

## `receptor = require("melf/receptor/worker")(keys, onopen)`

* `keys :: {string}`
* `onopen(alias, socket)`
  * `alias :: string`
  * `socket :: ws.WebSocket`
* `receptor :: antena.ReceptorWorker`

## `require("melf")(options, callback)`

* `options :: object`
  * `emitter :: antena.Emitter`
  * `alias :: string`
  * `key :: string`
  * `formatter :: object`
    * `data = parse(message)`
      * `message :: string`
      * `data :: *`
    * `message =  stringify(data)`
      * `data :: *`
      * `message :: string`
  * `callback(error, melf)`
    * `error :: Error`
    * `melf :: melf.Melf`

## `Melf :: object`

* `alias :: string`
* `rprocedures :: {RProcedure}`
* `rcall(recipient, name, data, callback)`
  * `recipient :: string`
  * `name :: string`
  * `data :: *`
  * `callback(error, data)`
    * `error :: Error`
    * `data :: *`
* `data2 = rcall(recipient, name, data1)`
  * `recipient :: string`
  * `name :: string`
  * `data1 :: *`
  * `data2 :: *`
* `close(code, reason)`
  * `code :: number`
  * `reason :: string`
* Event `error`
  * `error :: Error`
* Event `close`
  * `code :: number`
  * `reason :: string`

## `rprocedure(origin, data, callback)`

* `rprocedure :: RProcedure`
* `origin :: string`
* `data :: *`
* `callback(error, data)`
  * `error :: Error`
  * `data :: *`
