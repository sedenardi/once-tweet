const ENABLE_LOGGING = false;
module.exports = function(msg) {
  if (ENABLE_LOGGING) {
    console.log(msg);
  }
};
