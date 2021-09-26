const producer = require('./producer');
const { getPkgJsonDir } = require('./base');
const queue = require('./queue');
const express = require('express');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

(async () => {
  try {
    await producer();
    const base = await getPkgJsonDir();
    queue.pdf.process(`${base}/src/consumer.js`);
  } catch (error) {
    console.log(error);
  }
})(); // will be watching folder

const serverAdapter = new ExpressAdapter();

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(queue.pdf)],
  serverAdapter: serverAdapter,
});

const app = express();

serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());
app.listen(3001, () => {
  console.log('Running on 3000');
});
