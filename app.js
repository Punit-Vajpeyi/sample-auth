var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var bcrypt = require('bcrypt');

//Authentication packages
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var MySqlStore = require('express-mysql-session')(session);

var index = require('./routes/index');
var login = require('./routes/login');
var registration = require('./routes/registration');
var profile = require('./routes/profile');

passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log('username ', username);
        console.log('password', password);

        const db = require('./database');

        db.query('SELECT user_id, password FROM users WHERE username = ?', [username], function (err,results, fields) {
            if(err) {
                done(err)
            }

            if(results.length === 0) {
                return done(null, false);
            } else {

                var hash = results[0].password.toString();

                bcrypt.compare(password, hash, function (err, response) {
                    console.log('login response', response, password);

                    if (response == true) {
                        return done(null, {user_id: results[0].user_id});
                    } else {
                        return done(null, false);
                    }

                });
            }

        });


    }
));

var app = express();

require('dotenv').config();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database : process.env.DB_NAME
};

var sessionStore = new MySqlStore(options);

app.use(session({
    secret: 'lsjflfjlsdjfsdlfjlsdjf',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
    // cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.use('/', index);
app.use('/registration', registration);
app.use('/profile', profile);
app.use('/login', login);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
