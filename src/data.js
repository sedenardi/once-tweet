'use strict';

const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const path = require('path');
const zlib = require('bluebird').promisifyAll(require('zlib'));
const fs = require('bluebird').promisifyAll(require('fs'));
const s3 = require('./s3')();

const fileName = 'rss-tweet.sqlite';
const filePath = path.resolve(__dirname, `../${fileName}`);
const tmpPath = path.resolve(`/tmp/${fileName}`)
const zFilePath = filePath + '.zip';

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
    return fs.writeFileAsync(tmpPath, res);
  });
};

const s3Close = function() {
  return fs.readFileAsync(tmpPath).then((res) => {
    return zlib.gzipAsync(res);
  }).then((zipped) => {
    return s3.upload('rss-tweet.sqlite.zip', zipped);
  });
};

module.exports = function(opts) {
  let db;
  return {
    open: function() {
      const zAction = opts.noCompression ?
        Promise.resolve() :
        (opts.local ? localOpen() : s3Open());
      const path = opts.local ? filePath : tmpPath;
      return zAction.then(() => {
        return new Promise((resolve, reject) => {
          db = new sqlite3.Database(path, (err) => {
            if (err) { return reject(err); }
            return resolve();
          });
        });
      });
    },
    run: function(sql, params) {
      return new Promise((resolve, reject) => {
        db.run(sql, params, (err, res) => {
          if (err) { return reject(err); }
          return resolve(res);
        });
      });
    },
    get: function(sql, params) {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, res) => {
          if (err) { return reject(err); }
          return resolve(res);
        });
      });
    },
    all: function(sql, params) {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, res) => {
          if (err) { return reject(err); }
          return resolve(res);
        });
      });
    },
    trim: function() {
      return this.run(
        'delete from Items where PubDate < ?;',
        [moment().subtract(4, 'hours').toDate()]
      );
    },
    close: function() {
      const zAction = opts.local ? localClose() : s3Close();
      return this.trim().then(() => {
        return new Promise((resolve, reject) => {
          db.close((err) => {
            if (err) { return reject(err); }
            return resolve();
          });
        });
      }).then(() => {
        return zAction;
      });
    }
  };
};
