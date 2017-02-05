'use strict';

const request = require('request');

module.exports = {
  head: (url) => {
    return new Promise((resolve, reject) => {
      request({
        method: 'HEAD',
        url: url,
        followAllRedirects: true,
        jar: true
      }, (err, res) => {
        if (err) { return reject(err); }
        return resolve(res.request.href);
      })
    });
  }
};
