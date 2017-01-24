const _ = require('lodash');
const moment = require('moment');
const fetcher = require('./fetcher');
const FeedItem = require('./FeedItem');

class Feed {
  constructor(feed) {
    this.id = feed.id;
    this.Name = feed.Name;
    this.Urls = feed.Urls;
    this.Handle = feed.Handle;

    this.LastUpdate = feed.LastUpdate;
  }
  run(db) {
    return fetcher(this.Urls).then((res) => {
      const items = _(res)
        .filter((r) => { return r.pubDate > this.LastUpdate; })
        .map(FeedItem.parse)
        .orderBy(['PubDate'], ['asc'])
        .value();
      console.log(`${items.length} items in ${this.Name}`);
      const seq = items.reduce((r, v) => {
        r = r.then(() => { return v.run(db, this.Handle); });
        return r;
      }, Promise.resolve());
      return seq;
    });
  }
}
Feed.parse = function(feed, data) {
  feed.Urls = _(data[1]).filter({ FeedId: feed.id }).map('Url').value();
  feed.Handle = _.find(data[2], { FeedId: feed.id });

  const lastUpdate = _.find(data[3], { Name: 'LastUpdate' });
  feed.LastUpdate = lastUpdate.Value ? moment(lastUpdate.Value) : moment().subtract(3, 'hours');

  return new Feed(feed);
};

module.exports = Feed;
