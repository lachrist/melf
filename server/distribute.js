
module.exports = function (connections, origin) {
  return function (channel, recipient, event) {
    if (recipient in connections) {
      connections[recipient].receive(channel, origin, event);
    } else if ("token" in event) {
      connections[origin].receive(channel, "", {
        echo: event.token,
        error: "recipient-not-found",
        data: null
      });
    }
  };
};
