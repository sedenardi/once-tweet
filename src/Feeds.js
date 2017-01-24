const moment = require('moment');
const Feed = require('./Feed');

class Feeds {
  constructor(feeds) {
    this.Feeds = feeds.Feeds;
  }
  save(db) {
    return db.run(
      'update Meta set Value = ? where Name = ?;',
      [moment().toISOString(), 'LastUpdate']
    );
  }
  run(db) {
    const runs = this.Feeds.map((f) => { return f.run(db); });
    return Promise.all(runs).then(() => {
      return this.save(db);
    });
  }
}
Feeds.get = function(db) {
  return Promise.all([
    db.all('select * from Feeds;'),
    db.all('select * from FeedUrls;'),
    db.all('select * from FeedHandles;'),
    db.all('select * from Meta;')
  ]).then((res) => {
    const feeds = res[0].map((v) => {
      return Feed.parse(v, res);
    });
    return Promise.resolve(new Feeds({ Feeds: feeds }));
  });
};

module.exports = Feeds;
