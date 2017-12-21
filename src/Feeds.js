'use strict';

const moment = require('moment');
const _ = require('lodash');
const BigNumber = require('bignumber.js');
const Feed = require('./Feed');

const feedsQuery = (db) => { return db.query('select * from once_tweet.Feeds;'); };
const metaQuery = (db) => { return db.query('select * from once_tweet.Meta;'); };
const metaUpdate = (db, max) => {
  const sql = 'update once_tweet.Meta set `Value` = ? where `Name` = \'since_id\'';
  return db.query(sql, [max]);
};

class Feeds {
  constructor(feeds) {
    this.db = feeds.db;
    this.Feeds = feeds.Feeds;
  }
  save(maxes) {
    const compacted = _(maxes)
      .compact()
      .map((s) => { return s.toString(); })
      .value();
    if (compacted.length) {
      const max = BigNumber.max(compacted);
      return metaUpdate(this.db, max.toString());
    } else {
      return Promise.resolve();
    }
  }
  run() {
    const runs = this.Feeds.map((f) => { return f.run(); });
    return Promise.all(runs).then((maxes) => {
      return this.save(maxes);
    });
  }
  cleanup() {
    const threshold = moment().subtract(3, 'months').unix();
    const sql = 'delete from once_tweet.Items where created_at < ?';
    return db.query(sql, [threshold]);
  }
}
Feeds.get = function(db) {
  return Promise.all([
    feedsQuery(db),
    metaQuery(db)
  ]).then((res) => {
    const feeds = res[0].map((v) => {
      return Feed.parse(v, res[1], db);
    });
    return Promise.resolve(new Feeds({ db: db, Feeds: feeds }));
  });
};

module.exports = Feeds;
