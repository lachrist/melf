
module.exports = (mstring) => {
  const parts = /^[@!|]([0-9a-z]+)\//.exec(mstring);
  return parts && parts[1];
};
