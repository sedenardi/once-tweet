'use strict';

const config = require('../config');

module.exports = function() {
  const AWS = config.AWS();
  const dynamodb = new AWS.DynamoDB();
  const docClient = new AWS.DynamoDB.DocumentClient();
  return {
    get: function(query) {
      return new Promise((resolve, reject) => {
        docClient.get(query, (err, res) => {
          if (err) { return reject(err); }
          return resolve(res);
        });
      });
    },
    getItem: function(query) {
      return new Promise((resolve, reject) => {
        dynamodb.getItem(query, (err, res) => {
          if (err) { return reject(err); }
          return resolve(res);
        });
      });
    },
    scan: function(query) {
      return new Promise((resolve, reject) => {
        docClient.scan(query, (err, res) => {
          if (err) { return reject(err); }
          return resolve(res);
        });
      });
    },
    put: function(params) {
      return new Promise((resolve, reject) => {
        docClient.put(params, (err, res) => {
          if (err) { return reject(err); }
          return resolve(res);
        });
      });
    },
    batchWrite: function(params) {
      return new Promise((resolve, reject) => {
        docClient.batchWrite(params, (err, res) => {
          if (err) { return reject(err); }
          return resolve(res);
        });
      });
    }
  };
};
