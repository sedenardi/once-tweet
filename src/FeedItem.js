const cheerio = require('cheerio');
const moment = require('moment');

class FeedItem {
  constructor(item) {
    this.Title = item.Title;
    this.Url = item.Url;
    this.PubDate = item.PubDate;
    this.Image = item.Image;
  }
  run(db) {
    return db.get('select * from Items where Url = ?', [this.Url]).then((res) => {
      if (res) {
        return Promise.resolve();
      }
      if (moment().diff(this.PubDate) < moment.duration(2, 'hours')) {
        console.log(this.getTweet());
      }
      return db.run(
        'insert into Items(Url,Title,PubDate) values (?,?,?)',
        [this.Url, this.Title, this.PubDate]
      );
    }).catch((err) => {
      console.log(err);
    });
  }
  getTweet() {
    return `${this.Title} ${this.Url}`;
  }
}
FeedItem.parse = function(rawItem) {
  const item = {
    Title: rawItem.title,
    Url: rawItem.link,
    PubDate: rawItem.pubDate
  };

  if (rawItem.description) {
    const $ = cheerio.load(`<body>${rawItem.description}</body>`);
    const imgs = $('body').find('img');
    if (imgs.length) {
      item.Image = imgs.eq(0).attr('src');
    }
  }

  return new FeedItem(item);
};

module.exports = FeedItem;
