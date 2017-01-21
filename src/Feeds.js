const Feed = require('./Feed');

class Feeds {
  constructor(feeds) {
    this.Feeds = feeds.Feeds;
  }
}
Feeds.get = function(db) {
  return Promise.all([
    db.all('select * from Feeds'),
    db.all('select * from FeedUrls'),
    db.all('select * from FeedHandles')
  ]).then((res) => {
    const feeds = res[0].map((v) => {
      return Feed.parse(v, res);
    });
    return Promise.resolve(new Feeds({ Feeds: feeds }));
  });
};

module.exports = Feeds;
