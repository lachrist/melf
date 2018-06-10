module.exports = (string, sperator, limit) => {
  const array = string.split(sperator, limit-1);
  let sum = 0;
  let index = array.length;
  while (index--)
    sum += array[index].length+sperator.length;
  array.push(string.substring(sum));
  return array;
};