'use strict';

const moment = require('moment');
const Feed = require('./Feed');
const dynamo = require('./dynamo')();

class Feeds {
  constructor(feeds) {
    this.Feeds = feeds.Feeds;
  }
  save() {
    return dynamo.put({
      TableName: 'rss_Meta',
      Item: {
        Name: 'LastUpdate',
        Value: moment().toISOString()
      }
    });
  }
  run() {
    const runs = this.Feeds.map((f) => { return f.run(); });
    return Promise.all(runs).then(() => {
      return this.save();
    });
  }
}
Feeds.get = function() {
  return Promise.all([
    dynamo.scan({ TableName: 'rss_Feeds' }),
    dynamo.scan({ TableName: 'rss_Meta' })
  ]).then((res) => {
    const feeds = res[0].Items.map((v) => {
      return Feed.parse(v, res[1].Items);
    });
    return Promise.resolve(new Feeds({ Feeds: feeds }));
  });
};

module.exports = Feeds;
