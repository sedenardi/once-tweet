'use strict';

const _ = require('lodash');
const moment = require('moment');
const twitter = require('./twitter');
const fetcher = require('./fetcher');
const FeedItem = require('./FeedItem');

class Feed {
  constructor(feed) {
    this.id = feed.id;
    this.Name = feed.Name;
    this.Urls = feed.Urls;
    this.Handle = feed.Handle;
    this.Key = feed.Key;
    this.Secret = feed.Secret;

    this.LastUpdate = feed.LastUpdate;
  }
  run() {
    return fetcher(this.Urls).then((res) => {
      const items = _(res)
        .filter((r) => { return r.pubDate > this.LastUpdate; })
        .map(FeedItem.parse)
        .uniqBy('Url')
        .orderBy(['PubDate'], ['asc'])
        .value();
      console.log(`${items.length} items in ${this.Name}`);
      const twit = twitter(this);
      const seq = items.reduce((r, v, i) => {
        const last = i === (items.length - 1);
        r = r.then(() => { return v.run(twit, last); });
        return r;
      }, Promise.resolve());
      return seq;
    });
  }
}
Feed.parse = function(feed, meta) {
  const lastUpdate = _.find(meta, { Name: 'LastUpdate' });
  feed.LastUpdate = lastUpdate.Value ? moment(lastUpdate.Value) : moment().subtract(3, 'hours');

  return new Feed(feed);
};

module.exports = Feed;
