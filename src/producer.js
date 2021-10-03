const { pdf: pdfQueue } = require('./queue');
const chokidar = require('chokidar');
const { getPkgJsonDir } = require('./base');

module.exports = async () => {
  try {
    console.log('PDF Queue Producer');
    const basePath = await getPkgJsonDir();
    const watcher = chokidar.watch(`${basePath}/input`, {
      ignored: /^\./,
      persistent: true,
    });

    watcher.on('add', async function (path) {
      if (path && path.endsWith('.pdf')) {
        await pdfQueue.sendToQueue({
          path,
          at: new Date(),
        });
        console.log('File', path, 'has been added');
      }
    });
  } catch (error) {
    throw error;
  }
};
