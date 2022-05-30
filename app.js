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
const db = require('./config/connect');
db.connect;
const accountModel = require('./models/account');


var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

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
    showStatus: function(quyen){
      if (quyen == 1) {
        return "<span style='color: rgb(255, 190, 0);'>Chờ xác minh</span>"
      }
      else if (quyen == 2) {
        return "<span style='color: #1abc9c;'>Đã xác thực</span>"
      }
      else if (quyen == 3) {
        return "<span style='color: rgb(255, 160, 0);'>Chờ cập nhật CMND</span>"
      }
      else if (quyen == 4) {
        return "<span style='color: #ff0000;'>Tài khoản bị vô hiệu hóa</span>"
      }
      else if (quyen == 5) {
        return "<span style='color: #ff0000;'>Tài khoản bị khóa vô thời hạn</span>"
      }
      return ""
    },

    showTransactionStatus: function(confirm){
      if (confirm == 0) {
        return "<span style='color: rgb(255, 170, 0);'>Chờ duyệt</span>"
      }
      else if (confirm == 1) {
        return "<span style='color: #1abc9c;'>Hoàn tất</span>"
      }
      else if (confirm == 2) {
        return "<span style='color: #ff0000;'>Giao dịch bị hủy</span>"
      }
      return ""
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
  cookie: { maxAge: 60000 * 60 * 2 },
}));
app.use(flash());

//check login 
app.use(function(req, res, next) {
  if (!req.session.user 
    && req.path !== "/login" 
    && req.path !== "/register"
  ) 
    return res.redirect('/login')
  else
   return next()
});

//check doi mat khau lan dau
app.use(function(req, res, next) {
  if ( req.session.user && req.session.user.needResetPassword 
    && !req.path.includes("resetPassword") 
    && req.path != '/logout'
  ) 
    return res.redirect('/resetPassword')
  else 
    return next()
});

//update lai user session
app.use(async function(req, res, next) {
  if (req.session.user ) {
    let updatedUser = await accountModel.findOne({ username: req.session.user.username }).lean()
    req.session.user = updatedUser
    res.locals.user = updatedUser
    res.locals.isAdmin = updatedUser.quyen == 0 ? true : false
  }
  next()
});

//check account status (xac minh chua)
app.use(function(req, res, next) {
  if ( 
    req.session.user 
    && req.session.user.quyen != 0
    && req.session.user.quyen != 2 //quyen != 2 ==> chua xac minh

    //những trang đc truy cập khi tài khoản chờ xác minh
    && req.path != '/personalPage'
    && req.path != '/updateCMND'
    && !req.path.includes("resetPassword")
    && req.path != '/index'
    && req.path != '/'
    && req.path != '/logout'
  ) {
    req.session.myFlash = 'Tài khoản cần được xác minh để truy cập trang này.'
    return res.redirect('/')
  }
  else 
    return next()
});

//flash message (flash thuan, ko dung module connect-flash)
app.use(function(req, res, next) {
  res.locals.myFlash = req.session.myFlash
  delete req.session.myFlash
  next()
});


//router middlewares================================================================
app.use('/', indexRouter);
app.use('/', userRouter);
app.use('/admin', adminRouter);

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

