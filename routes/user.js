var router = require('express').Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads' })
const nodemailer = require("nodemailer");


// model
const Account = require('../models/account');

//validators=========================================================================
const loginValidators = [
  check('username')
    .exists().withMessage('Missing email field')
    .notEmpty().withMessage('Tên đăng nhập không hợp lệ'),

  check('password')
    .exists().withMessage('Missing password field')
]

const registerValidators = [
  check('sdt')
    .exists().withMessage('Missing sdt field')
    .notEmpty().withMessage('Hãy nhập số điện thoại')
    .custom(val => {
      if (val.match(/[a-zA-Z]/)) 
        throw new Error('Số điện thoại không hợp lệ')
      else if (!val.match(/^[0-9]{10,11}$/)) 
        throw new Error('Số điện thoại bao gồm 10 hoặc 11 chữ số')
      else return true
    }),

  check('email')
    .exists().withMessage('Missing email field')
    .notEmpty().withMessage('Vui lòng nhập email')
    .isEmail().withMessage('Email không hợp lệ'),

  check('tenNguoiDung')
    .exists().withMessage('Missing tenNguoiDung field')
    .notEmpty().withMessage('Vui lòng nhập họ và tên'),

  check('diaChi')
    .exists().withMessage('Missing diaChi field')
    .notEmpty().withMessage('Vui lòng nhập địa chỉ'),

  check('ngaySinh')
    .exists().withMessage('Missing ngaySinh field')
    .notEmpty().withMessage('Vui lòng chọn ngày sinh') 
]

const resetPasswordValidators = [
  check('newPassword')
    .exists().withMessage('Missing newPassword field')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu mới')
    .custom((value, { req }) => {
      if (value.match(/[^a-z0-9]/)) {
        throw new Error('Mật khẩu mới không được chứa kí tự đặc biệt')
      }
      if (value === req.body.oldPassword) {
        throw new Error('Mật khẩu mới trùng với mật khẩu hiện tại')
      }
      return true
    })
    .isLength({ min:6 }).withMessage('Mật khẩu mới cần tối đa 6 ký tự'),

  check('confirmNewPassword')
    .exists().withMessage('Missing confirmNewPassword field')
    .notEmpty().withMessage('Mật khẩu xác nhận không hợp lệ')
    .custom((value, { req }) => {
      if (value != req.body.newPassword) {
        throw new Error('Mật khẩu xác nhận không khớp')
      }

      return true
    }),
]

//==========================================================================================
router.get('/logout', function(req, res, next) {
  req.session.destroy()

  res.redirect('/login')
});

router.get('/login', function(req, res, next) {
  if (req.session.user) {
    res.redirect('/')
  }

  res.locals.msg = req.flash('msg')
  res.locals.username = req.flash('username')
  res.locals.password = req.flash('password')
  res.render('login', { title: 'login', layout: false });
});

//login post =====================================================================================
router.post('/login', loginValidators, async function(req, res, next) {
  let { username, password } = req.body
  let results = validationResult(req)

  //validate input
  if (results.errors.length > 0) {
    req.flash('msg', results.errors[0].msg)
    req.flash('username', username)
    return res.redirect('login');
  }

  let user = await Account.findOne({ username })

  //validate user
  if (!user) {
    req.flash('msg', 'Tên đăng nhập hoặc mật khẩu không đúng')
    req.flash('username', username)
    return res.redirect('/login')
  }

  if (user.quyen == 4) {
    req.flash('msg', 'Tài khoản này đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008.')
    req.flash('username', username)
    return res.redirect('/login')    
  }

  //loi = 3 => kiem tra thoi gian bi khoa 
  if (user.loi == 3) {
    let currentTime = new Date()
    let timeBeUnlocked = new Date(user.timeBeUnlocked)

    if (timeBeUnlocked > currentTime) {
      req.flash('msg', 'Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút.')
      req.flash('username', username)
      return res.redirect('/login')    
    }
  }

  //loi = 6 => block
  if (user.loi == 6) {
    req.flash('msg', 'Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ.')
    req.flash('username', username)
    return res.redirect('/login')    
  }

  //check password
  let hashed = user.password
  if (!bcrypt.compareSync(password, hashed)) {
    //set thoi gian duoc mo khoa la sau 1 phut
    if (user.loi == 2) {
      let timeBeUnlocked = new Date()
      timeBeUnlocked.setMinutes(timeBeUnlocked.getMinutes() + 1)

      await Account.updateOne({ username }, { timeBeUnlocked })
    }
    else if (user.loi == 5) {
      await Account.updateOne({ username }, { quyen: 5 })
    }

    await Account.updateOne({ username }, { $inc: { loi: 1 } })

    req.flash('msg', 'Tên đăng nhập hoặc mật khẩu không đúng.')
    req.flash('username', username)
    return res.redirect('/login')
  }

  //login success
  await Account.updateOne({ username }, { loi: 0 })
  req.session.user = user
  return res.redirect('/')
});


router.get('/register', function(req, res, next) {
  if (req.session.user) {
    res.redirect('/')
  }

  res.locals.msg = req.flash('msg')
  res.locals.successMsg = req.flash('successMsg')
  res.locals.sdt = req.flash('sdt')
  res.locals.email = req.flash('email')
  res.locals.tenNguoiDung = req.flash('tenNguoiDung')
  res.locals.diaChi = req.flash('diaChi')
  res.locals.ngaySinh = req.flash('ngaySinh')

  res.render('register', { title: 'register', layout: false });
});

//register post =====================================================================================
const getImages = upload.fields([{ name: 'matTruocCMND'}, { name: 'matSauCMND'}])

router.post('/register', getImages, registerValidators, async function(req, res, next) {
  let { sdt, email, tenNguoiDung, diaChi, ngaySinh } = req.body
  let results = validationResult(req)

  //flash
  req.flash('sdt', sdt)
  req.flash('email', email)
  req.flash('tenNguoiDung', tenNguoiDung)
  req.flash('diaChi', diaChi)
  req.flash('ngaySinh', ngaySinh)

  // //validate fields
  if (results.errors.length > 0) {
    req.flash('msg', results.errors[0].msg)
    return res.redirect('register');
  }
  if (!req.files.matTruocCMND || !req.files.matSauCMND) {
    req.flash('msg', 'Vui lòng chọn ảnh mặt trước và mặt sau CMND')
    return res.redirect('register');
  }

  //create random username and password
  let username = Math.random().toString().slice(2, 12)
  let password = Math.random().toString(36).slice(2, 8)
  let matTruocCMND = `${sdt}_MT.png`
  let matSauCMND = `${sdt}_MS.png`
  
  new Account({ 
    sdt, email, tenNguoiDung, diaChi, ngaySinh, username, matTruocCMND, matSauCMND,
    password: bcrypt.hashSync(password, 10),
  }).save()
  .then(async (newAccount) => {
    //create and save user resources
    let userFolder = `./public/userResources/${sdt}`
    fs.mkdirSync(userFolder, { recursive: true })
    fs.renameSync(req.files.matTruocCMND[0].path, `${userFolder}/${sdt}_MT.png`)
    fs.renameSync(req.files.matSauCMND[0].path, `${userFolder}/${sdt}_MS.png`)

    //gửi username và password tới email ng dùng
    const transporter = nodemailer.createTransport({
      host: 'mail.phongdaotao.com',
      port: 25,
      auth: { user: 'sinhvien@phongdaotao.com', pass: 'svtdtu' },
      ignoreTLS: true,
    });

    try {
      await transporter.sendMail({
        from: '"Digital Wallet" <sinhvien@phongdaotao.com>', 
        to: email,
        subject: "Đăng ký tài khoản thành công",
        text: `Thông tin đăng nhập:\nusername: ${username}\npassword: ${password}`,
      });
    } catch (error) {
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ lỗi gửi email');
      console.log(error.message);
    }
  
    //lưu thông tin tài khoản vào account_list.txt để dễ kiểm tra
    let newAccountInfo = `\nten: ${tenNguoiDung}\n username: ${username}\n password: ${password}\n`
    fs.appendFileSync("./account_list.txt", newAccountInfo);

    req.flash('successMsg', `Đăng ký thành công! Kiểm tra email để biết thông tin đăng nhập.
                            <br> tk: ${username}
                            <br> mk: ${password}
                            <br> <a href="/login">Login now</a>`)
    return res.redirect('register');
  })
  .catch(err => {
    if (err.code == 11000) {
      req.flash('msg', 'Số điện thoại hoặc email đã được sử dụng')
      return res.redirect('register');
    }
    else {
      console.log(err.message);
      req.flash('msg', 'Có lỗi xảy ra, vui lòng thử lại sau')
      return res.redirect('register');
    }
  })
});


//get reset password ============================================================================================
router.get('/resetPassword', function(req, res, next) {
  // kiểm tra đổi mk bắt buộc khi login lần đầu
  if (req.session.user.needResetPassword) {
    res.locals.isFirstTime = true
  }

  res.locals.msg = req.flash('msg')
  res.locals.successMsg = req.flash('successMsg')

  res.render('resetPassword', { title: 'Đổi mật khẩu', layout: false });
});


//xu ly doi mat khau dang nhap lan dau
router.post('/resetPassword1', resetPasswordValidators, async function(req, res, next) {
  let results = validationResult(req)

  //validate fields
  if (results.errors.length > 0) {
    req.flash('msg', results.errors[0].msg)
    return res.redirect('/resetPassword');
  }

  //update password
  let newHashedPassword = bcrypt.hashSync(req.body.newPassword, 10) 
  await Account.updateOne(
    { sdt: req.session.user.sdt }, 
    { password: newHashedPassword, needResetPassword: false }
  )

  req.session.user = await Account.findOne({ sdt: req.session.user.sdt })

  res.redirect('/')  
});


//xu ly doi mat khau KHONG phai dang nhap lan dau
router.post('/resetPassword2', resetPasswordValidators, async function(req, res, next) {
  let results = validationResult(req)

  //validate oldPassword
  if (req.body.oldPassword == "") {
    req.flash('msg', 'Vui lòng nhập mật khẩu hiện tại')
    return res.redirect('/resetPassword');
  }

  if (!bcrypt.compareSync(req.body.oldPassword, req.session.user.password)) {
    req.flash('msg', 'Mật khẩu hiện tại không đúng')
    return res.redirect('/resetPassword');
  }

  //validate other fields
  if (results.errors.length > 0) {
    req.flash('msg', results.errors[0].msg)
    return res.redirect('/resetPassword');
  }

  let newHashedPassword = bcrypt.hashSync(req.body.newPassword, 10) 
  await Account.updateOne({ sdt: req.session.user.sdt }, { password: newHashedPassword })

  req.session.user = await Account.findOne({ sdt: req.session.user.sdt })

  req.flash('successMsg', 'Đổi mật khẩu thành công.')
  res.redirect('/resetPassword')
});





module.exports = router;