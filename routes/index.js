var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  console.log(req.isAuthenticated());
  res.render('home', { title: 'Express' });
});

router.get('/logout', function (req,res,next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
