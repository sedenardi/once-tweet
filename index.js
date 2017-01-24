const data = require('./src/data')({ noCompression: false, local: false });
const Feeds = require('./src/Feeds');

const run = function() {
  data.open().then((db) => {
    return Feeds.get(db).then((feeds) => {
      return feeds.run(db);
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
