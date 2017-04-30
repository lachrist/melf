
module.exports = function (request, url, splitter) {
  return {
    sync: function (path, body) {
      var response = request(body?"POST":"GET", url, "/"+splitter+path, {}, body);
      if (response.status !== 200 && response.status !== 100)
        throw new Error(response.status+" ("+response.reason+") for "+JSON.stringify({url:url, splitter:splitter, path:path, body:body}, null, 2));
      return response.body;
    },
    async: function (path, body, callback) {
      request(body?"POST":"GET", url, "/"+splitter+path, {}, body, function (error, response) {
        if (error)
          throw error;
        if (response.status !== 200 && response.status !== 100)
          throw new Error(response.status+" ("+response.reason+") for "+JSON.stringify({url:url, splitter:splitter, path:path, body:body}, null, 2));
        callback(response.body);
      });
    }
  };
};
