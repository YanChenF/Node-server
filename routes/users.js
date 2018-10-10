var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bodyParser = require('body-parser');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');
router.use(bodyParser.json());

/* GET users listing. */
router.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get('/', cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  User.find(req.query)
  .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post('/register', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
      if(req.body.firstname) {
        user.firstname = req.body.firstname;
      }
      if(req.body.lastname) {
        user.lastname = req.body.lastname;
      }
      user.save((err, user) => {
        if(err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});          
        } else {
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({status: 'Registration Successful', user: user});
          });
        }
      });
    }
  });
});

router.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res, next) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'Log in successfully', token: token});
});

router.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get('/logout', cors.cors, (req, res, next) => {
  if(req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  } 
})

module.exports = router;
