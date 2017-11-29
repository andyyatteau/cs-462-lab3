const express = require('express');
const router = express.Router();
const foursquare = require('../foursquare');
const newapp = new foursquare();
var session;

/* GET home page. */
router.get('/', function (req, res) {
    session = req.session;
    res.render('index', {user: session.user});
});

router.get('/login', function (req, res) {
    session = req.session;
    res.writeHead(303, {'location': newapp.getAuthClientRedirectUrl()});
    res.end();
});

router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

router.get('/users', function (req, res) {
    session = req.session;
    newapp.getUsers(function (users) {
        res.render('users', {'users': users, 'title': "Users"});
    });
});

router.get('/users/:userId', function (req, res) {
    session = req.session;
    var self = (('undefined' !== typeof session.user) && !(session.user.id !== req.params.userId));
    var userCheckins = newapp.getCheckinsForUser(req.params.userId);
    res.render('checkins', {'checkins': userCheckins, 'isSelf': self.toString(), 'title': "Checkins"});
});

router.get('/redirect_uri', function (req, res) {
    session = req.session;
    newapp.redirect(req.query.code, function (error) {
        if (error) {
            res.send('Error - ' + error.message);
        }
        else {
            theredirect(function (user) {
                session.user = user;
                res.redirect('/users');
            });
        }
    });
    var theredirect = function (redirect) {
        newapp.getSelf(function (error, result) {
            loggingin(result.user, redirect);
        });
    };
    var loggingin = function (user, redirect) {
        newapp.getRecentCheckins(function (error, jsonResponse) {
            newapp.newUser(user, function (user) {
                newapp.addCheckin(user, jsonResponse, redirect(user));
            });
        });
    }
});

module.exports = router;