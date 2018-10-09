
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
//var io = require('socket.io')(server);
//var ent = require('ent'); no utilizado
const session = require('express-session');

const userC = require('./controllers/userC');
const indexC = require('./controllers/indexC');
const profileC = require('./controllers/profileC');
const chatC = require('./controllers/chatC');
//var router = express.Router(); no utilizado

const app = express();

app.use(session({
  name: 'ID_SESSION',
  secret: 'cl4v3 s3cr3t4',
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



app.get('/favicon.ico', (req, res) => res.status(204).send('/img/hombre-mujer-blanco.svg'));
app.use('/user', userC);
app.use('/profile', profileC);
app.use('/chat', chatC);
app.use('/', indexC);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(({ status = 500 }, req, res, next) => {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(status);
  res.render('./pages/404.ejs', {title: 'Page not found'});
});

app.use(express.static('../public'));

module.exports = app;