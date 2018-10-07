var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var leadersRouter = require('./routes/leaderRouter');
var dishesRouter = require('./routes/dishRouter');
var promosRouter = require('./routes/promoRouter');


const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, {useNewUrlParser: true});

connect.then((db) => {
  console.log('Connected to server successfully');
}, (err) => {
  console.log(err);
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('123456-789-0'));
app.use(session({
  name: 'session-id',
  secret: '123-4456-79980',
  resave: false,
  saveUninitialized: false,
  store: new FileStore()
}));


function auth(req, res, next) {
  console.log(req.session);
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
    if(username === 'admin', password === 'password') {
      req.session.user = 'admin';
      next();
    } else {
      var err = new Error('You are not authorized');
      err.status = 401;
      res.setHeader('WWW-Authenticate', 'Basic');
      next(err);
    }
  } else {
    if(req.session.user === 'admin') {
      console.log('req.session', req.session);
      next();
    } else {
      var err = new Error('You are not authorized');
      err.status = 401;
      next(err);
    }
  }
  
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishesRouter);
app.use('/promotions', promosRouter);
app.use('/leaders', leadersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
