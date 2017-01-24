const db = require('sqlite');
const moment = require('moment');
const path = require('path');
const zlib = require('bluebird').promisifyAll(require('zlib'));
const fs = require('bluebird').promisifyAll(require('fs'));

const filePath = path.resolve(__dirname, '../rss-tweet.sqlite');
const zFilePath = filePath + '.zip';

const trim = function() {
  return db.run(
    'delete from Items where PubDate < ?;',
    [moment().subtract(4, 'hours').toDate()]
  );
};

const localOpen = function() {
  return fs.readFileAsync(zFilePath).then((zipped) => {
    return zlib.gunzipAsync(zipped);
  }).then((res) => {
    return fs.writeFileAsync(filePath, res);
  });
};

const localClose = function() {
  return fs.readFileAsync(filePath).then((res) => {
    return zlib.gzipAsync(res);
  }).then((zipped) => {
    return fs.writeFileAsync(zFilePath, zipped);
  });
};

module.exports = {
  open: () => {
    return localOpen().then(() => {
      return db.open(filePath).then(() => {
        return Promise.resolve(db);
      });
    });
  },
  close: () => {
    return trim().then(() => {
      return db.close();
    }).then(() => {
      return localClose();
    });
  }
};
