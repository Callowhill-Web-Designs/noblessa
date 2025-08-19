// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// CORS middleware to allow requests from 11ty dev server
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:8080', 'http://localhost:8082'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Middleware
app.use(express.json());

// Session configuration (before routes)
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Server-side credential storage (in production, use a database)
const VALID_CREDENTIALS = {
  'ambassador': {
    password: 'noblessa2024',
    role: 'ambassador',
    permissions: ['resources', 'updates']
  },
  'partner': {
    password: 'luxury2024',
    role: 'partner',
    permissions: ['resources', 'updates', 'orders']
  },
  'admin': {
    password: 'admin2024',
    role: 'admin',
    permissions: ['resources', 'updates', 'orders', 'admin']
  }
};

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Authentication required' });
  }
};

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }
  
  const user = VALID_CREDENTIALS[username.toLowerCase()];
  
  if (user && user.password === password) {
    // Store user session
    req.session.user = {
      username: username.toLowerCase(),
      role: user.role,
      permissions: user.permissions,
      loginTime: new Date().toISOString()
    };
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        username: req.session.user.username,
        role: req.session.user.role,
        permissions: req.session.user.permissions
      }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Could not log out' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Logout successful' 
    });
  });
});

app.get('/api/auth/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ 
      success: true, 
      authenticated: true,
      user: {
        username: req.session.user.username,
        role: req.session.user.role,
        permissions: req.session.user.permissions
      }
    });
  } else {
    res.json({ 
      success: true, 
      authenticated: false 
    });
  }
});

// Protected routes example
app.get('/api/partner/resources', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Access granted to partner resources',
    user: req.session.user
  });
});

// Static file serving (after API routes to prevent conflicts)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Noblessa Partner Resources Server running at http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Authentication: Server-side with secure sessions`);
  console.log(`📝 API Endpoints:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/logout`);
  console.log(`   GET  /api/auth/session`);
  console.log(`   GET  /api/partner/resources`);
});
