
module.exports = function (connections, origin) {
  return function (recipient, event) {
    if (recipient in connections) {
      connections[recipient].receive(origin, event);
    } else if ("token" in event) {
      connections[origin].receive(recipient, {
        echo: event.token,
        error: "recipient-not-found",
        data: null
      });
    }
  };
};
