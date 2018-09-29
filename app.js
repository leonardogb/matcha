
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var io = require('socket.io')(server);
//var ent = require('ent'); no utilizado
var session = require('express-session');

var userC = require('./controllers/userC');
var indexC = require('./controllers/indexC');
var profileC = require('./controllers/profileC');
var chatC = require('./controllers/chatC');
//var router = express.Router(); no utilizado

var app = express();

app.use(session({
  secret: 'clave secreta',
  name: 'sessionId',
  resave: true,
  saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');



app.get('/favicon.ico', (req, res) => res.status(204)); //Si no hay favicon
app.use('/user', userC);
app.use('/profile', profileC);
app.use('/chat', chatC);
app.use('/', indexC);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('./pages/404.ejs', {title: 'Page not found'});
});

app.use(express.static('../public'));

module.exports = app;