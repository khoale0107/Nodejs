var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session');
var logger = require('morgan');
const expressHbs = require('express-handlebars') 
const flash = require('connect-flash');
const port = 3000

var app = express();

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');

// view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', expressHbs.engine({
  extname: 'hbs',

  helpers: {
    stt: function(index) {
      return index + 1;
    },
    changeMoney: function(m){
      let dollarUSLocale = Intl.NumberFormat('en-US');
      money = dollarUSLocale.format(m);
      return money
    },
  }
}))

//application middlewares===============================================================
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ 		
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 * 60 },
}));
app.use(flash());

//check login
app.use(function(req, res, next) {
  //check xem login chua
  if (!req.session.user && req.path !== "/login" && req.path !== "/register") 
    return res.redirect('/login')
  else
   return next()
});

//check xem doi pass khi dang nhap lan dau chua
app.use(function(req, res, next) {
  if ( req.session.user && req.session.user.needResetPassword && !req.path.includes("resetPassword") && req.path != '/logout') 
    return res.redirect('/resetPassword')
  else 
    return next()
});

//router middlewares================================================================
app.use('/', indexRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.stack = err.stack;
  res.locals.status = err.status;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {layout: false});
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))

