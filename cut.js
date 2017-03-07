
function unescape (str) {
  return str.replace("\\n", "\n").replace(/\\+n/g, function (match) { return match.subtring(1) });
}

module.exports = function () {
  cut = "";
  return function (text) {
    var lines = (cut+text).split("\n");
    cut = lines.pop();
    return lines.map(unescape);
  };
}
