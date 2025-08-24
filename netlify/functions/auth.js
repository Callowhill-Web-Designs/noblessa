// Netlify Function: Auth0 login/callback/logout
// Using express + passport-auth0 with serverless-http

const express = require('express');
const cookieSession = require('cookie-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const serverless = require('serverless-http');

// Read configuration from environment variables
const {
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_CALLBACK_URL, // e.g., https://your-site.netlify.app/api/auth/callback
  SESSION_SECRET = 'change-this-secret',
  AUTH0_LOGOUT_REDIRECT = '/',
} = process.env;

if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET) {
  console.warn('[auth] Missing Auth0 environment variables.');
}

// Passport user serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new Auth0Strategy(
    {
      domain: AUTH0_DOMAIN,
      clientID: AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
      callbackURL: AUTH0_CALLBACK_URL,
      state: true,
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
      // Store minimal user profile
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
        picture: profile.picture,
        token: accessToken,
      };
      return done(null, user);
    }
  )
);

const app = express();

// Trust Netlify proxy
app.set('trust proxy', 1);

app.use(
  cookieSession({
    name: 'noblessa.sid',
    keys: [SESSION_SECRET],
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
const router = express.Router();

router.get('/api/auth/login', (req, res, next) => {
  // Optionally pass returnTo and store in session for callback
  const returnTo = req.query.returnTo || '/partner-resources/';
  req.session.returnTo = returnTo;
  passport.authenticate('auth0', {
    scope: 'openid profile email',
    state: 'login',
  })(req, res, next);
});

router.get('/api/auth/callback', (req, res, next) => {
  passport.authenticate('auth0', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login?error=unauthorized');

    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      const returnTo = req.session.returnTo || '/partner-resources/';
      // clear one-time value
      req.session.returnTo = null;
      return res.redirect(returnTo);
    });
  })(req, res, next);
});

router.get('/api/auth/logout', (req, res) => {
  // Destroy local session (cookie-session)
  req.logout?.();
  req.session = null;
  // Redirect to Auth0 logout
  const returnTo = encodeURIComponent(AUTH0_LOGOUT_REDIRECT || '/');
  const url = `https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${returnTo}`;
  res.redirect(url);
});

router.get('/api/auth/me', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, user: req.user });
});

app.use('/.netlify/functions/auth', router);

module.exports.handler = serverless(app);
