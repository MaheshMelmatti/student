const express = require('express');
const router = express.Router();
const User = require('../models/User');


// show login page (and signup form inline)
router.get('/login', (req, res) => {
res.render('login', { error: null });
});


// handle login
router.post('/login', async (req, res) => {
const { email, password } = req.body;
try {
const user = await User.findOne({ email });
if (!user) return res.render('login', { error: 'No user with that email' });
const match = await user.comparePassword(password);
if (!match) return res.render('login', { error: 'Incorrect password' });
req.session.user = { id: user._id, name: user.name, email: user.email };
res.redirect('/courses');
} catch (err) {
console.error(err);
res.render('login', { error: 'Something went wrong' });
}
});


// handle register user (signup)
router.post('/signup', async (req, res) => {
const { name, email, password } = req.body;
try {
const exists = await User.findOne({ email });
if (exists) return res.render('login', { error: 'Email already in use' });
const user = new User({ name, email, password });
await user.save();
req.session.user = { id: user._id, name: user.name, email: user.email };
res.redirect('/courses');
} catch (err) {
console.error(err);
res.render('login', { error: 'Failed to sign up' });
}
});


router.get('/logout', (req, res) => {
req.session.destroy(() => res.redirect('/login'));
});


module.exports = router;