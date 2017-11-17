var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var bcrypt = require('bcrypt');
var passport = require('passport');
const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('registration', { title: 'Registration' });
});

router.post('/', function(req, res, next) {

    req.checkBody('username', 'Username field cannot be empty.').notEmpty();
    req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
    req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
    req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
    req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
    req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
    req.checkBody('confirmPassword', 'Passwords do not match, please try again.').equals(req.body.password);

    // Additional validation to ensure username is alphanumeric with underscores and dashes
    req.checkBody('username', 'Username can only contain letters, numbers, or underscores.').matches(/^[A-Za-z0-9_-]+$/, 'i');

    var errors = req.validationErrors();

    if(errors){
        res.render('registration', { title: 'Registration Error' , errors: errors });

    } else {
        const db = require('../database.js');

        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        bcrypt.hash(password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            db.query('INSERT INTO users(username, email, password) VALUES (?,?,?)',
                [username,email,hash],
                function (error,results,field) {
                    if(error){
                        if(error.code == "ER_DUP_ENTRY"){
                            res.render('registration', { title: 'Registration Error' , errors: [{ msg: "Username or email is already present."}] });
                        } else {
                            res.render('registration', { title: 'Registration Error' , errors: [{ msg: "Some input is wrong."}] });
                        }
                    } else {

                        db.query('SELECT LAST_INSERT_ID() as user_id', function (error, results, fields) {
                            if (error) throw error;
                            const userId = results[0];
                            req.login(userId, function (err) {
                                res.redirect("/profile");
                            });
                        });
                    }
                }
            );
        });

    }
});

passport.serializeUser(function(userId, done) {
    done(null, userId);
});

passport.deserializeUser(function(userId, done) {
    done(null, userId);
});

function authenticationMiddleware () {
    return (req, res, next) => {
        console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

        if (req.isAuthenticated()) return next();
        res.redirect('/login')
    }
}

module.exports = router;
