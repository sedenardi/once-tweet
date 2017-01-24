const data = require('./src/data');
const Feeds = require('./src/Feeds');

const run = function() {
  data.open().then((db) => {
    return Feeds.get(db).then((feeds) => {
      return feeds.run(db);
    });
  }).then(() => {
    return data.close();
  }).catch((err) => {
    console.log(err);
  });
};

run();
