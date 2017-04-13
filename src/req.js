'use strict';

const request = require('request');
const cheerio = require('cheerio');

const head = function(url) {
  return new Promise((resolve, reject) => {
    request({
      method: 'HEAD',
      url: url,
      followAllRedirects: true,
      jar: true
    }, (err, res) => {
      if (err) { return reject(err); }
      return resolve(res.request.href);
    });
  });
};

const get = function(url) {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      url: url,
      followAllRedirects: true,
      jar: true
    }, (err, res) => {
      if (err) { return reject(err); }
      return resolve(res);
    });
  });
};

const getCardUrl = function(cardUrl) {
  return get(cardUrl).then((res) => {
    const $ = cheerio.load(res.body);
    const link = $('.permalink-tweet-container').find('a[data-expanded-url]').attr('data-expanded-url');
    return Promise.resolve(link);
  });
};

module.exports = {
  head,
  get,
  getCardUrl
};
