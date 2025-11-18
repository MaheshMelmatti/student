const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');

// middleware to ensure logged in
function ensureLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// view all courses
router.get('/', ensureLoggedIn, async (req, res) => {
  const courses = await Course.find();

  const user = await User.findById(req.session.user.id).populate('registeredCourses');
  const registeredIds = user.registeredCourses.map(c => String(c._id));

  res.render('view_courses', { courses, registeredIds });
});

// show register course page
router.get('/register/:id', ensureLoggedIn, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.redirect('/courses');

  res.render('register_course', { course, error: null });
});

// handle registration
router.post('/register/:id', ensureLoggedIn, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.session.user.id);

    if (!course || !user) return res.redirect('/courses');

    if (user.registeredCourses.some(c => String(c) === String(course._id))) {
      return res.render('register_course', { course, error: 'Already registered for this course' });
    }

    if (course.seats <= 0) {
      return res.render('register_course', { course, error: 'No seats available' });
    }

    user.registeredCourses.push(course._id);
    await user.save();

    course.seats = Math.max(0, course.seats - 1);
    await course.save();

    res.redirect('/courses');
  } catch (err) {
    console.error(err);
    res.render('register_course', { course: {}, error: 'Registration failed' });
  }
});

module.exports = router;
