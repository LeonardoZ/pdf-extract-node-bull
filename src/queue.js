const Queue = require('bull');
const config = {
  redis: {
    port: 6379,
    host: 'redis',
    password: 'Redis2021!',
    limiter: {
      max: 10,
      duration: 5000,
    },
  },
};

const pdfQueue = new Queue('pdf-to-parse', config)
  .on('error', function (error) {
    console.error(`Error in bull queue happend: ${error}`);
  })
  .on('failed', function (job, error) {
    console.error(`Task was failed with reason: ${error}`);
  });

module.exports = {
  pdf: pdfQueue,
};
