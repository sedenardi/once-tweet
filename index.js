const db = require('sqlite');
const Feeds = require('./src/Feeds');
const path = require('path');

const filePath = path.resolve(__dirname, './rss-tweet.sqlite');

const run = function() {
  db.open(filePath).then(() => {
    return Feeds.get(db);
  }).then((feeds) => {
    const runs = feeds.Feeds.map((f) => { return f.run(db); });
    return Promise.all(runs);
  }).then(() => {
    return db.close();
  }).catch((err) => {
    console.log(err);
  });
};

// open db

// fetch feeds

// run feeds

// fetch items

// query database

// order, decide whether to tweet, save

run();
