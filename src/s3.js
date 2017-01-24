'use strict';

const config = require('../config');

module.exports = function() {
  const AWS = config.AWS();
  const s3 = new AWS.S3();

  return {
    upload: (key, object) => {
      const uploadParams = {
        Bucket: config.S3.Bucket,
        Key: key,
        ACL: config.S3.ACL,
        Body: object
      };
      return new Promise((resolve, reject) => {
        s3.upload(uploadParams, (err, data) => {
          if (err) { return reject(err); }
          return resolve(data);
        });
      });
    },
    getObject: (key) => {
      return new Promise((resolve, reject) => {
        s3.getObject({ Bucket: config.S3.Bucket, Key: key }, (err, res) => {
          if (err) { return reject(err); }
          return resolve(res.Body);
        });
      });
    }
  };
};
