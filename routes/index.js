var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'login', layout: false });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'register', layout: false });
});

router.get('/transferMoney', function(req, res, next) {
  res.render('transferMoney', { title: 'transferMoney', layout: false});
});

router.get('/buyCardMobile', function(req, res, next) {
  res.render('buyCardMobile', { title: 'buyCardMobile', layout: false});
});

router.get('/detailsTransactionHistory', function(req, res, next) {
  res.render('detailsTransactionHistory', { title: 'detailsTransactionHistory', layout: false});
});

router.get('/manageAccountList', function(req, res, next) {
  res.render('manageAccountList', { title: 'manageAccountList'});
});

router.get('/recharge', function(req, res, next) {
  res.render('recharge', { title: 'recharge', layout: false});
});

router.get('/shop', function(req, res, next) {
  res.render('shop', { title: 'shop'});
});

router.get('/manageApprovals', function(req, res, next) {
  res.render('manageApprovals', { title: 'manageApprovals'});
});

router.get('/transactionHistory', function(req, res, next) {
  res.render('transactionHistory', { title: 'transactionHistory'});
});

router.get('/manageApprovals', function(req, res, next) {
  res.render('manageApprovals', { title: 'manageApprovals'});
});

router.get('/withdrawMoney', function(req, res, next) {
  res.render('withdrawMoney', { title: 'withdrawMoney', layout: false});
});

router.get('/personalPage', function(req, res, next) {
  res.render('personalPage', { title: 'personalPage'});
});

module.exports = router;
