const express = require('express');
const path = require('path');
const session = require('express-session');

const indexRoutes = require('./routes/index');
const eventRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');
const { attachAdminStatus } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Security headers & hardening ---
app.disable('x-powered-by');

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

// --- View engine ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session (secret should come from env in production)
app.use(session({
  secret: process.env.SESSION_SECRET || 'hive-raid-app-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
}));

// Make isAdmin available in all templates
app.use(attachAdminStatus);

// --- Routes ---
app.use('/', indexRoutes);
app.use('/events', eventRoutes);
app.use('/admin', adminRoutes);

// --- 404 handler ---
app.use((_req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Hive Raid App running at http://localhost:${PORT}`);
});
