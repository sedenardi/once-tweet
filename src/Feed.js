const _ = require('lodash');
const fetcher = require('./fetcher');
const FeedItem = require('./FeedItem');

class Feed {
  constructor(feed) {
    this.id = feed.id;
    this.Name = feed.Name;
    this.Urls = feed.Urls;
    this.Handle = feed.Handle;
  }
  run(db) {
    return fetcher(this.Urls).then((res) => {
      const items = _(res).map(FeedItem.parse).orderBy(['PubDate'], ['asc']).value();
      const seq = items.reduce((r, v) => {
        r = r.then(() => { return v.run(db); });
        return r;
      }, Promise.resolve());
      return seq;
    });
  }
}
Feed.parse = function(feed, data) {
  feed.Urls = _(data[1]).filter({ FeedId: feed.id }).map('Url').value();
  feed.Handle = _.find(data[2], { FeedId: feed.id });
  return new Feed(feed);
};

module.exports = Feed;
