const db = require('sqlite');
const path = require('path');

const filePath = path.resolve(__dirname, '../rss-tweet.sqlite');

module.exports = {
  open: () => {
    return db.open(filePath).then(() => {
      return Promise.resolve(db);
    });
  },
  close: () => {
    return db.close();
  }
};
