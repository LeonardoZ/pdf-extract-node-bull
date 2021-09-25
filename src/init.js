const producer = require('./producer');

(async () => {
  try {
    await producer();
  } catch (error) {
    console.log(error);
  }
})(); // will be watching folder
