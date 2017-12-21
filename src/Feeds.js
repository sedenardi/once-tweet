'use strict';

const moment = require('moment');
const _ = require('lodash');
const BigNumber = require('bignumber.js');
const Feed = require('./Feed');
const db = require('./db')();

const feedsQuery = () => { return db.query('select * from once_tweet.Feeds;'); };
const metaQuery = () => { return db.query('select * from once_tweet.Meta;'); };

class Feeds {
  constructor(feeds) {
    this.Feeds = feeds.Feeds;
  }
  save(maxes) {
    // const compacted = _(maxes)
    //   .compact()
    //   .map((s) => { return s.toString(); })
    //   .value();
    // if (compacted.length) {
    //   const max = BigNumber.max(compacted);
    //   return dynamo.put({
    //     TableName: 'once_Meta',
    //     Item: {
    //       Name: 'since_id',
    //       Value: max.toString()
    //     }
    //   });
    // } else {
    //   return Promise.resolve();
    // }
  }
  run() {
    const runs = this.Feeds.map((f) => { return f.run(); });
    return Promise.all(runs).then((maxes) => {
      return this.save(maxes);
    });
  }
}
Feeds.get = function() {
  return Promise.all([
    feedsQuery(),
    metaQuery()
  ]).then((res) => {
    const feeds = res[0].map((v) => {
      return Feed.parse(v, res[1]);
    });
    return Promise.resolve(new Feeds({ Feeds: feeds }));
  });
};

module.exports = Feeds;
