'use strict';

const Feeds = require('./src/Feeds');

const run = function() {
  const db = require('./src/db')();
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
      context.done();
    }).catch((err) => {
      context.done(err);
    });
  }
};
