const db = require('sqlite');
const Feeds = require('./src/Feeds');
const path = require('path');

const filePath = path.resolve(__dirname, './rss-tweet.sqlite');

const run = function() {
  db.open(filePath).then(() => {
    return Feeds.get(db);
  }).then((feeds) => {
    return feeds.run(db);
  }).then(() => {
    return db.close();
  }).catch((err) => {
    console.log(err);
  });
};

run();
