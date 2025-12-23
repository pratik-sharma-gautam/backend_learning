const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();

// ---------------- CONFIG ----------------
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));

// ---------------- MIDDLEWARE ----------------
const isAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};

// ---------------- ROUTES ----------------
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Signup
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    const exists = await User.findOne({ username });
    if (exists) return res.send('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });

    res.redirect('/login');
  } catch (err) {
    res.send('Signup error');
  }
});

// Login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.send('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send('Wrong password');

    req.session.user = {
      id: user._id,
      username: user.username
    };

    res.redirect('/profile');
  } catch (err) {
    res.send('Login error');
  }
});

// Profile (Protected)
app.get('/profile', isAuth, (req, res) => {
  res.render('profile', { user: req.session.user });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
