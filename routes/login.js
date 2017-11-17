var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'Login' });
});


router.post('/', passport.authenticate(
    'local',{
      successRedirect: '/profile',
      failureRedirect: '/login'
}));

module.exports = router;
