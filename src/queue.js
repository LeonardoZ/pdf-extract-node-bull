const Bull = require('bull');

const pdfQueue = new Bull('pdf-to-parse');

module.exports = {
  pdf: pdfQueue,
};
