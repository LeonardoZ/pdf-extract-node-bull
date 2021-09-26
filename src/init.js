const producer = require('./producer');
const { getPkgJsonDir } = require('./base');
const queue = require('./queue');

(async () => {
  try {
    await producer();
    const base = await getPkgJsonDir();
    queue.pdf.process(`${base}/src/consumer.js`);
  } catch (error) {
    console.log(error);
  }
})(); // will be watching folder
