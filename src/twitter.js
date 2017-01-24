'use strict';

const Twitter = require('twitter');
const request = require('request');
const config = require('../config');

const SLEEP_TIME = 8*1000;
const sleep = function() {
  return new Promise((resolve) => {
    setTimeout(() => { resolve(); }, SLEEP_TIME);
  });
};

module.exports = function(handle) {
  const client = new Twitter({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token_key: handle.Key,
    access_token_secret: handle.Secret
  });

  const retryablePost = function(status, cb) {
    client.post('statuses/update', status, (error, tweet, response) => {
      if (error) {
        if (error.length) {
          if (error[0].code === 187) {
            console.log(`Dupe tweet from ${handle.Name}: ${status.status}`);
            return cb();
          }
        }
        console.log(error);
        setTimeout(() => { retryablePost(status, cb); }, 1000*10);
      } else { cb(null, response); }
    });
  };

  const postWithMedia = function(item, cb) {
    const status = { status: item.tweetString() };
    request({
      url: item.Image,
      encoding: null
    }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        retryablePost(status, cb);
      } else {
        client.post('media/upload', { media: body }, (err, media, response) => {
          if (!err) {
            status.media_ids = media.media_id_string;
            retryablePost(status, cb);
          } else {
            retryablePost(status, cb);
          }
        });
      }
    });
  };

  return {
    post: function(feedItem, last) {
      const p = new Promise((resolve, reject) => {
        if (feedItem.Image) {
          postWithMedia(feedItem, (err, res) => {
            if (err) { return reject(err); }
            return resolve(res);
          });
        } else {
          retryablePost({ status: feedItem.tweetString() }, (err, res) => {
            if (err) { return reject(err); }
            return resolve(res);
          });
        }
      });
      return p.then(() => {
        console.log(`Tweeting from ${handle.Name}`);
        return !last ? sleep() : Promise.resolve();
      });
    }
  };
};
