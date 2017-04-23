# melf
Pull-based communications for JavaScript processes

[Usage](usage/run.js)


// socket send:
//   - asynchronous request  (?id:data)
//   - asynchronous response (!id:data)
// socket receive:
//   - asynchronous request   (?id:data)
//   - asynchronous response  (!id:data)
//   - ping (ping)
//
// We don't send synchronous messages through
// the HTTP connection because we want to be
// able to operate the synchronous channel
// immediatly and not wait for `socket.onopen`.
//
// HTTP request:
//   - synchronous request  (/sync ?id:data)
//   - synchronous response (/sync !id:data)
//   - pull (/pull)
//   - wait (/wait)
// HTTP response:
//   - synchronous requests   (?id:data).join(\n)
//   - synchronous responses  (!id:data).join(\n)


child.stdout.pipe(new Stream.Writable({
  write: function (chunk, encoding, callback) {
    process.stdout.write(Chalk.green(chunk.toString("utf8")), callback);
  }
}));
child.stderr.pipe(new Stream.Writable ({
  write: function (chunk, encoding, callback) {
    process.stderr.write(Chalk.red(chunk.toString("utf8")), callback);
  }
}));
