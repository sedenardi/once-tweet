'use strict';

const Twitter = require('twitter');
const config = require('../config');

const SLEEP_TIME = 6*1000;
const sleep = function() {
  return new Promise((resolve) => {
    setTimeout(() => { resolve(); }, SLEEP_TIME);
  });
};

module.exports = function(feed) {
  const client = new Twitter({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token_key: feed.Key,
    access_token_secret: feed.Secret
  });

  const lookup = function(ids) {
    return client.get('statuses/lookup', { id: ids.join(',') });
  };

  const getTimeline = function(screen_name, since_id) {
    const params = { screen_name: screen_name };
    if (since_id) { params.since_id = since_id; }
    return client.get('statuses/user_timeline', params);
  };

  const retweet = function(id, last) {
    return client.post(`statuses/retweet/${id}`, {}).then(() => {
      console.log(`Tweeting ${id} from ${feed.Handle}`);
      return !last ? sleep() : Promise.resolve();
    });
  };

  const getTweet = function(id) {
    return client.get('statuses/show', { id: id });
  };

  return {
    lookup: lookup,
    getTimeline: getTimeline,
    retweet: retweet,
    getTweet
  };
};
