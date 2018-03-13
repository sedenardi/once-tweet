const _ = require('lodash');
const moment = require('moment');
const BigNumber = require('bignumber.js');
const twitter = require('./twitter');
const FeedItem = require('./FeedItem');
const log = require('./logger');

class Feed {
  constructor(feed) {
    this.id = feed.id;
    this.Name = feed.Name;
    this.ScreenNames = feed.ScreenNames;
    this.Handle = feed.Handle;
    this.Key = feed.Key;
    this.Secret = feed.Secret;

    this.Since = feed.Since;
    this.db = feed.db;
  }
  run() {
    const twit = twitter(this);
    log(`Fetching tweets for ${this.Name}`);
    const fetches = this.ScreenNames.map((n) => {
      return twit.getTimeline(n, this.Since);
    });
    return Promise.all(fetches).then((res) => {
      log(`Found ${res.length} tweets for ${this.Name}`);
      const itemActions = _(res)
        .flatten()
        .map((t) => { return FeedItem.parse(t, this.db); })
        .value();
      return Promise.all(itemActions);
    }).then((res) => {
      const items = _(res)
        .compact()
        .uniqBy('Url')
        .orderBy(['created_at'], ['asc'])
        .value();
      console.log(`${items.length} items in ${this.Name}`);
      const seq = items.reduce((r, v, i) => {
        const last = i === (items.length - 1);
        r = r.then(() => { return v.run(twit, last); });
        return r;
      }, Promise.resolve());
      return seq.then(() => {
        if (items.length) {
          const ids = _.map(items, 'id_str');
          const max = BigNumber.max(ids);
          return Promise.resolve(max);
        } else {
          return Promise.resolve();
        }
      });
    });
  }
}
Feed.parse = function(feed, meta, db) {
  feed.Since = _.find(meta, { Name: 'since_id' }).Value;
  feed.ScreenNames = feed.ScreenNames.split(',');
  feed.db = db;
  return new Feed(feed);
};

module.exports = Feed;
