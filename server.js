const express = require('express');
const session = require('express-session');
const path = require('path');
const { passport, ensureAuth } = require('./auth');
const apiRoutes = require('./routes/api');

function createServer(discordClient) {
  const app = express();

  app.set('discordClient', discordClient); // عشان نقدر نوصله من جوه الراوتس

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 24 }, // يوم واحد
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // ---- Auth Routes ----
  app.get('/auth/discord', passport.authenticate('discord'));

  app.get(
    '/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => res.redirect('/dashboard.html')
  );

  app.get('/auth/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
  });

  // ---- API Routes ----
  app.use('/api', apiRoutes);

  // حماية صفحة الداشبورد: لو مش مسجل دخول يرجعله لصفحة اللوجين
  app.get('/dashboard.html', ensureAuth, (req, res, next) => next());

  return app;
}

module.exports = createServer;
