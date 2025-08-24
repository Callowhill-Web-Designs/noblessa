// Netlify Function: Secure pages gate with SSR using Eleventy templates
// Uses the session created by auth.js to allow only authenticated users

const express = require('express');
const cookieSession = require('cookie-session');
const passport = require('passport');
const serverless = require('serverless-http');
const path = require('path');
const fs = require('fs');

const {
  SESSION_SECRET = 'change-this-secret',
} = process.env;

const app = express();
app.set('trust proxy', 1);

app.use(
  cookieSession({
    name: 'noblessa.sid',
    keys: [SESSION_SECRET],
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 1000 * 60 * 60 * 8,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Basic serialize/deserialize to read user from cookie session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  const returnTo = encodeURIComponent(req.originalUrl || '/partner-resources');
  return res.redirect(`/api/auth/login?returnTo=${returnTo}`);
}

function renderStaticFromPublic(fileRelative, res) {
  // Render a prebuilt HTML file from public/ if present, else 404
  const abs = path.join(process.cwd(), 'public', fileRelative);
  if (!fs.existsSync(abs)) return res.status(404).send('Not found');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return fs.createReadStream(abs).pipe(res);
}

const router = express.Router();

router.get(['/partner-resources', '/partner-resources/'], ensureAuth, (req, res) => {
  return renderStaticFromPublic('partner-resources/index.html', res);
});

router.get(['/partner-directory', '/partner-directory/'], ensureAuth, (req, res) => {
  return renderStaticFromPublic('partner-directory/index.html', res);
});

app.use('/.netlify/functions/secure', router);

module.exports.handler = serverless(app);
