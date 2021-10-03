const producer = require('./producer');
const { getPkgJsonDir } = require('./base');
const queue = require('./queue');

(async () => {
  try {
    await producer();
    const base = await getPkgJsonDir();
  } catch (error) {
    console.log(error);
  }
})(); // will be watching folder
