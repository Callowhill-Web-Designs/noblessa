const serverless = require('serverless-http');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// Example hardcoded credentials (replace with DB in production)
const USERS = [
  { username: 'ambassador', password: 'noblessa2024', role: 'ambassador', permissions: ['view', 'download'] }
];

// API routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.authenticated = true;
    req.session.user = { username: user.username, role: user.role, permissions: user.permissions };
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get('/api/auth/session', (req, res) => {
  if (req.session.authenticated) {
    res.json({ success: true, authenticated: true, user: req.session.user });
  } else {
    res.json({ success: true, authenticated: false });
  }
});

module.exports.handler = serverless(app);
