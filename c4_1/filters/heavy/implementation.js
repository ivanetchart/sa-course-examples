module.exports = function(data) {
  console.log(`HEAVY: with data: ${JSON.stringify(data)}`);

  const number = Math.floor(Math.random() * 11);

  if (number > 5) {
    for(let i = 0; i < 10; i++) {}
  }

  const result = Object.assign({
    firstAndLastName: `${data.lastName}, ${data.firstName}`
  }, data);

  return Promise.resolve(result);
}
