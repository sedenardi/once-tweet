const moment = require('moment');
const _ = require('lodash');
const req = require('./req');
const crypto = require('crypto');
const log = require('./logger');

class FeedItem {
  constructor(item) {
    this.id_str = item.id_str;
    this.handle = item.handle;
    this.Url = item.Url;
    this.Hash = item.Hash;
    this.created_at = item.created_at;
    this.db = item.db;
  }
  save() {
    const sql = 'insert into once_tweet.Items(`Hash`,ScreenName,id_str,Url,created_at) value(?,?,?,?,?);';
    return this.db.query(sql, [
      this.Hash,
      this.handle,
      this.id_str,
      this.Url,
      this.created_at.toString().slice(0, -3)
    ]);
  }
  run(twit, last) {
    log(`Checking whether tweet already exists`);
    const sql = 'select * from once_tweet.Items where `Hash` = ?;';
    return this.db.query(sql, [this.Hash]).then((res) => {
      if (res[0]) {
        log(`Tweet does already exist`);
        return Promise.resolve();
      }
      log(`Tweet doesn't already exist, saving`);
      return this.save().then(() => {
        return twit ? twit.retweet(this.id_str, last) : Promise.resolve();
      });
    }).catch((err) => {
      console.log(err);
    });
  }
}
FeedItem.parse = function(rawItem, db) {
  const item = {
    id_str: rawItem.id_str,
    handle: rawItem.user.screen_name,
    created_at: moment(rawItem.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY').valueOf(),
    db: db
  };

  if (rawItem.entities.urls.length) {
    const expandedUrl = rawItem.entities.urls[0].expanded_url;
    let urlAction = Promise.resolve(expandedUrl);
    if (expandedUrl.indexOf(rawItem.id_str) !== -1) {
      urlAction = req.getCardUrl(expandedUrl);
    }
    return urlAction.then((url) => {
      if (!url) { return Promise.resolve(null); }
      return req.head(url).then((resolvedUrl) => {
        item.Url = resolvedUrl.split(/[?#]/)[0].toLowerCase();
        item.Hash = crypto.createHash('sha1').update(item.Url).digest('hex');
        return Promise.resolve(new FeedItem(item));
      });
    });
  } else {
    return Promise.resolve(null);
  }
};

module.exports = FeedItem;
