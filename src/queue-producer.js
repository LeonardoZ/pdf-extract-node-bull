const { pdf: pdfQueue } = require('./queue');
var chokidar = require('chokidar');

module.exports = () => {
  console.log('PDF Queue Producer');

  var watcher = chokidar.watch('file or dir', {
    ignored: /^\./,
    persistent: true,
  });

  watcher.on('add', function (path) {
    console.log('File', path, 'has been added');
  });
};
