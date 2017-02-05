'use strict';

const moment = require('moment');
const _ = require('lodash');
const req = require('./req');
const dynamo = require('./dynamo')();

class FeedItem {
  constructor(item) {
    this.id_str = item.id_str;
    this.Url = item.Url;
    this.created_at = item.created_at;
  }
  save() {
    return dynamo.put({
      TableName: 'once_Items',
      Item: {
        Url: this.Url,
        created_at: this.created_at
      }
    });
  }
  run(twit, last) {
    return dynamo.get({
      TableName: 'once_Items',
      Key: { Url: this.Url },
      ConsistentRead: true
    }).then((res) => {
      if (res.Item) {
        return Promise.resolve();
      }
      return this.save().then(() => {
        return twit ? twit.retweet(this.id_str, last) : Promise.resolve();
      });
    }).catch((err) => {
      console.log(err);
    });
  }
}
FeedItem.parse = function(rawItem) {
  const item = {
    id_str: rawItem.id_str,
    created_at: moment(rawItem.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY').valueOf()
  };

  if (rawItem.entities.urls.length) {
    return req.head(rawItem.entities.urls[0].expanded_url).then((url) => {
      item.Url = url.split(/[?#]/)[0].toLowerCase();
      return Promise.resolve(new FeedItem(item));
    });
  } else {
    return Promise.resolve(null);
  }
};

module.exports = FeedItem;
