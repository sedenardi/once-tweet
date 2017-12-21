'use strict';

const Feeds = require('./src/Feeds');
const db = require('./src/db')();

const run = function() {
  return Feeds.get(db).then((feeds) => {
    return feeds.run().then(() => {
      return feeds.cleanup();
    });
  }).then(() => {
    return db.end();
  });
};

module.exports = {
  handler: (event, context, callback) => {
    run().then(() => {
      callback();
    }).catch((err) => {
      callback(err);
    });
  }
};
