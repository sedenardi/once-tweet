'use strict';

const config = require('../config');
const mysql = require('mysql2');

module.exports = function() {
  const pool = mysql.createPool(config.mysql);
  return {
    query: function(sql, params) {
      return new Promise((resolve, reject) => {
        if (typeof sql !== 'string') {
          return reject(new Error('Missing query string'));
        }
        if (params !== undefined && params.constructor !== Array) {
          return reject(new Error('Params must be an array'));
        }
        pool.getConnection((err, conn) => {
          if (err) { return reject(err); }
          conn.query(sql, params, (error, res) => {
            conn.release();
            if (error) { return reject(error); }
            return resolve(res);
          });
        });
      });
    },
    end: function() {
      return new Promise((resolve, reject) => {
        pool.end((err) => {
          if (err) { return reject(err); }
          console.log('Closing database.');
          return resolve();
        });
      });
    }
  };
};
