const { pdf: pdfQueue } = require('./queue');
var chokidar = require('chokidar');

async function getPkgJsonDir() {
  const { dirname } = require('path');
  const {
    constants,
    promises: { access },
  } = require('fs');

  for (let path of module.paths) {
    try {
      let prospectivePkgJsonDir = dirname(path);
      await access(path, constants.F_OK);
      return prospectivePkgJsonDir;
    } catch (e) {}
  }
}

const readFile = () =>
  new Promise(async (resolve, reject) => {
    try {
      console.log('PDF Queue Producer');
      const basePath = await getPkgJsonDir();
      const watcher = chokidar.watch(`${basePath}/input`, {
        ignored: /^\./,
        persistent: true,
      });

      watcher.on('add', function (path) {
        if (path.endsWith('.pdf')) {
          console.log('File', path, 'has been added');
          resolve(path);
        }
      });
    } catch (error) {
      reject(error);
    }
  });

module.exports = async () => {
  try {
    const file = await readFile();
    const job = await pdfQueue.add(
      {
        file,
        at: new Date(),
      },
      { jobid: 'add-pdf', timeout: 1000 }
    );
    console.log(`Added job: ${job}`);
  } catch (error) {
    throw error;
  }
};
