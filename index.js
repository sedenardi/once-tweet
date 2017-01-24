'use strict';

const data = require('./src/data')({ noCompression: false, local: false });
const Feeds = require('./src/Feeds');

const run = function() {
  return data.open().then(() => {
    return Feeds.get(data).then((feeds) => {
      return feeds.run(data);
    });
  }).then(() => {
    return data.close();
  }).catch((err) => {
    console.log(err);
  });
};

module.exports = {
  handler: (event, context) => {
    run().then(() => {
      context.done();
    });
  }
};
