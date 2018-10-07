var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then(user => {
    if(user !== null) {
      var err = new Error('Username already exists!');
      err.status = 403;
      throw err;
    } else {
      return User.create({
        username: req.body.username,
        password: req.body.password
      });
    }
  })
  .then(user => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful', user: user});
  }, err => next(err)).catch(err => next(err));
});

router.post('/login', (req, res, next) => {
  if(!req.session.user) {
    var authHeader = req.headers.authorization;
    if(!authHeader) {
      var err = new Error('You are not authorized');
      err.status = 401;
      res.setHeader('WWW-Authenticate', 'Basic');
      next(err);
      return;
    }
    var autho = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var username = autho[0];
    var password = autho[1];
    User.findOne({username: username})
    .then(user => {
      if(!user) {
        var err = new Error('Username not found!');
        err.status = 401;
        return next(err);
      } else if(user.password !== password) {
        var err = new Error('Password is not correct');
        err.status = 401;
        return next(err);
      } else if(user.username === username && user.password === password) {
        req.session.user = 'authorized';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Logged you in!');
      }
    }).catch(err => next(err));
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You have already logged in!')
  }
});

router.get('/logout', (req, res, next) => {
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
