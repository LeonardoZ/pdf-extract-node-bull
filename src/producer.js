const cron = require('node-cron');
const producer = require('./queue-producer');

const task = cron.schedule('*/5 * * * * *', producer, {
  scheduled: false,
});

module.exports = task;
