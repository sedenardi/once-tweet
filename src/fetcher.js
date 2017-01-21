const request = require('request');
const FeedParser = require('feedparser');
const _ = require('lodash');

const fetch = function(url) {
  return new Promise((resolve, reject) => {
    const req = request(url);
    const feedparser = new FeedParser();
    const items = [];
    feedparser.on('data', (record) => { items.push(record); });
    feedparser.on('end', () => { resolve(items); });
    feedparser.on('error', (err) => { reject(err); });
    req.on('error', (err) => { reject(err); });
    request(url).pipe(feedparser);
  });
};

const multiFetch = function(urls) {
  const actions = urls.map((url) => { return fetch(url); });
  return Promise.all(actions).then((res) => {
    const allItems = _.flatten(res);
    return Promise.resolve(allItems);
  });
};

module.exports = function(url) {
  if (url instanceof Array) {
    return multiFetch(url);
  } else {
    return fetch(url);
  }
};
