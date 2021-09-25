const cron = require('node-cron');

const task = cron.schedule(
  '*/5 * * * * *',
  () => {
    console.log('Cron is working');
  },
  {
    scheduled: false,
  }
);

module.exports = task;
