const db = require('sqlite');
const moment = require('moment');
const path = require('path');
const zlib = require('bluebird').promisifyAll(require('zlib'));
const fs = require('bluebird').promisifyAll(require('fs'));
const s3 = require('./s3')();

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

const s3Open = function() {
  return s3.getObject('rss-tweet.sqlite.zip').then((zipped) => {
    return zlib.gunzipAsync(zipped);
  }).then((res) => {
    return fs.writeFileAsync(filePath, res);
  });
};

const s3Close = function() {
  return fs.readFileAsync(filePath).then((res) => {
    return zlib.gzipAsync(res);
  }).then((zipped) => {
    return s3.upload('rss-tweet.sqlite.zip', zipped);
  });
};

module.exports = function(opts) {
  return {
    open: () => {
      const zAction = opts.noCompression ?
        Promise.resolve() :
        (opts.local ? localOpen() : s3Open());
      return zAction.then(() => {
        return db.open(filePath).then(() => {
          return Promise.resolve(db);
        });
      });
    },
    close: () => {
      const zAction = opts.local ? localClose() : s3Close();
      return trim().then(() => {
        return db.close();
      }).then(() => {
        return zAction;
      });
    }
  };
};
