const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const users = require('../controllers/users');
const router = express.Router();
const catchAsync = require('../utilis/catchAsync');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

module.exports = router;



