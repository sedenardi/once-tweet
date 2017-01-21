const express = require('express');
const session = require('express-session');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const config = require('./config');

passport.serializeUser((user, done) => { done(null, user); });
passport.deserializeUser((obj, done) => { done(null, obj); });

passport.use(new TwitterStrategy({
  consumerKey: config.twitter.consumer_key,
  consumerSecret: config.twitter.consumer_secret,
  callbackURL: config.twitter.callbackUrl
}, (token, tokenSecret, profile, done) => {
  const user = {
    token: token,
    tokenSecret: tokenSecret,
    profile: profile
  };
  return done(null, user);
}));

const app = express();
app.use(session({ secret: '1234' }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth', (req, res) => {
  const body = `
  <html>
    <body>
      <a href="/auth/twitter">Auth Twitter</a>
    </body>
  </html>`
  res.send(body);
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/auth' }),
  (req, res) => {
    const body = `
    <html>
      <body>
        <pre>
          ${JSON.stringify(req.user, null, 2)}
        </pre>
      </body>
    </html>`;
    res.send(body);
  }
);

app.listen(3000, function webStarted() {
  console.log('Created web server');
});
