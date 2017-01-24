'use strict';

const cheerio = require('cheerio');
const moment = require('moment');
const _ = require('lodash');
const twitter = require('./twitter');

class FeedItem {
  constructor(item) {
    this.Title = item.Title;
    this.Url = item.Url;
    this.PubDate = item.PubDate;
    this.Image = item.Image;
  }
  save(data) {
    return data.run(
      'insert into Items(Url,PubDate) values (?,?);',
      [this.Url, this.PubDate]);
  }
  run(data, handle, last) {
    return data.get('select * from Items where Url like ?;', [this.Url]).then((res) => {
      if (res) {
        return Promise.resolve();
      }
      return this.save(data).then(() => {
        if (moment().diff(this.PubDate) < moment.duration(3, 'hours') && handle) {
          const twit = twitter(handle);
          return twit.post(this, last);
        } else {
          return Promise.resolve();
        }
      });
    }).catch((err) => {
      console.log(err);
    });
  }
  tweetString() {
    return `${this.Title.slice(0, 116)} ${this.Url}`;
  }
}
FeedItem.parse = function(rawItem) {
  const item = {
    Title: rawItem.title,
    Url: rawItem.link.split(/[?#]/)[0].toLowerCase(),
    PubDate: rawItem.pubDate
  };

  if (rawItem.description) {
    const $ = cheerio.load(`<body>${rawItem.description}</body>`);
    const imgs = $('body').find('img');
    if (imgs.length) {
      item.Image = imgs.eq(0).attr('src');
    } else {
      const media = _.get(rawItem, '[media:content][@]');
      if (media && media.medium === 'image' &&
        (parseInt(media.width) > 400 || parseInt(media.height) > 400 || (!media.width && !media.height))) {
        item.Image = media.url;
      }
    }
  }

  return new FeedItem(item);
};

module.exports = FeedItem;
