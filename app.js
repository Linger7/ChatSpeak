var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config/config.js');
var responseObject = require('./utilities/responseObject');

var session = require('express-session');
var mysql = require('mysql');
var MySQLStore = require('express-mysql-session')(session);
var sessionStore = new MySQLStore(config.mysqlParams);

var routes = require('./routes/index');
var accounts = require('./routes/accounts');
var profiles = require('./routes/profile');
var chatRoute = require('./routes/chatRoute');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
session = session({
    secret: "ikXbeBMa5zDlZFKRx021P5bqn",
    name: "chatspeak.sid",
    store: sessionStore,
    proxy: true,
    resave: true,
    saveUninitialized: true
});

app.use(session);

var sharedSession = require("express-socket.io-session");
io.use(sharedSession(session));
var chat = require('./routes/chat')(io);
server.listen(80);

//Authorize only signed in users
var userAuth = function(req, res, next){
    if(req.session && req.session.auth){
        return next();
    } else {
        res.render('error/error', {errorMessage : 'You must be signed into your account to do this!'}, function(err, html){
            res.send(responseObject.generateResponseObject('<i class="fa fa-exclamation-triangle red"></i> Oops, something went wrong!', html));
        });
    }
};

app.use('/', routes);
app.use('/accounts', accounts);
app.use('/profile', userAuth, profiles);
app.use('/chat', userAuth, chatRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(err.message);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err.message);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;