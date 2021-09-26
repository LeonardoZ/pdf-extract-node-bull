const extract = require('pdf-text-extract');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { getPkgJsonDir } = require('./base');
const path = require('path');

module.exports = async (job) => {
  console.log(`Processing ${job.id}`);

  var options = {
    cwd: './',
  };
  extract(job.data.path, options, async function (err, pages) {
    if (err) {
      console.log(err);
      return;
    }
    const basePath = await getPkgJsonDir();
    const baseName = path.basename(job.data.path);
    const id = uuidv4();
    const extractedData = {
      id,
      jobId: job.id,
      original: baseName,
      content: pages,
    };
    const json = JSON.stringify(extractedData);

    await fs.writeFile(
      `${basePath}/output/${id}.json`,
      json,
      'utf8',
      async function (err) {
        if (err) {
          console.log(err);
          return;
        }
        await fs.rename(
          job.data.path,
          `${basePath}/processed/${baseName}`,
          function (err) {
            if (err) {
              console.log(err);
              return;
            }
            console.log('Successfully renamed - AKA moved!');
          }
        );
      }
    );
  });
};
