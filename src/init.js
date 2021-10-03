const producer = require('./producer');
const { getPkgJsonDir } = require('./base');
const consumer = require('./consumer');

(async () => {
  try {
    await producer();
    await consumer();
  } catch (error) {
    console.log(error);
  }
})(); // will be watching folder
