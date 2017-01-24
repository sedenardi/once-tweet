'use strict';

const moment = require('moment');
const Feed = require('./Feed');

class Feeds {
  constructor(feeds) {
    this.Feeds = feeds.Feeds;
  }
  save(data) {
    return data.run(
      'update Meta set Value = ? where Name = ?;',
      [moment().toISOString(), 'LastUpdate']
    );
  }
  run(data) {
    const runs = this.Feeds.map((f) => { return f.run(data); });
    runs.push(this.save(data));
    return Promise.all(runs);
  }
}
Feeds.get = function(data) {
  return Promise.all([
    data.all('select * from Feeds;'),
    data.all('select * from FeedUrls;'),
    data.all('select * from FeedHandles;'),
    data.all('select * from Meta;')
  ]).then((res) => {
    const feeds = res[0].map((v) => {
      return Feed.parse(v, res);
    });
    return Promise.resolve(new Feeds({ Feeds: feeds }));
  });
};

module.exports = Feeds;
