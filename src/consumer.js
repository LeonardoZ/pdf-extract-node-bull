const extract = require('pdf-text-extract');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { getPkgJsonDir } = require('./base');
const path = require('path');
const queue = require('./queue');

const pdfConsumer = (ack, nack) => (data) => {
  const msg = JSON.parse(data.content.toString());
  var options = {
    cwd: './',
  };
  extract(msg.path, options, async function (err, pages) {
    try {
      if (err) {
        await nack(data);
        console.log(err);
        return;
      }

      const basePath = await getPkgJsonDir();

      const baseName = path.basename(msg.path);
      const id = uuidv4();
      const extractedData = {
        id,
        original: baseName,
        content: pages,
      };
      const json = JSON.stringify(extractedData);

      fs.writeFile(
        `${basePath}/output/${id}.json`,
        json,
        'utf8',
        async function (err) {
          if (err) {
            await nack(data);
            console.log(err);
            return;
          }
          fs.rename(
            msg.path,
            `${basePath}/processed/${baseName}`,
            async function (err) {
              if (err) {
                await nack(data);
                console.log(err);
                return;
              }
              await ack(data);
              console.log('Successfully renamed - AKA moved!');
            }
          );
        }
      );
    } catch (error) {
      await nack(data);
      console.log('Failed to process', error);
    }
  });
};

module.exports = () => queue.pdf.consumeFromQueue(pdfConsumer);
