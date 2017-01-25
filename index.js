'use strict';

const Feeds = require('./src/Feeds');

const run = function() {
  return Feeds.get().then((feeds) => {
    return feeds.run();
  }).catch((err) => {
    console.log(err);
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
