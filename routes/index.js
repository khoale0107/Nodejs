var express = require('express');

var router = express.Router();
var MongoClinet = require('mongodb').MongoClient;

// connect database
const db = require('../config/connect');
db.connect;

// model
const accountModel = require('../models/account');
const historyModel = require('../models/history');




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



router.get('/manageAccountList', async function(req, res, next) {
    let accounts = await accountModel.find()
    accounts = accounts.map(accountModel=>accountModel.toObject())   
    res.render('manageAccountList', {title: 'manageAccountList', accounts: accounts})
 
});


router.get('/manageApprovals', async function(req, res, next) {
  let historys = await historyModel.find()
  historys= historys.map(historyModel=>historyModel.toObject())
  res.render('manageApprovals', { title: 'manageApprovals',historys:historys});
});


router.get('/detailsTransactionHistory/:maGiaoDich', async function(req, res, next) {  
  ma = req.params.maGiaoDich;
  let history = await historyModel.findOne({maGiaoDich:ma})



  res.render('detailsTransactionHistory', { title: 'detailsTransactionHistory', layout: false,history:history.toObject()});
});


router.get('/personalPage', function(req, res, next) {
  res.render('personalPage', { title: 'personalPage'});
});



router.get('/recharge', function(req, res, next) {
  res.render('recharge', { title: 'recharge', layout: false});
});

router.get('/shop', function(req, res, next) {
  res.render('shop', { title: 'shop'});
});


router.get('/transactionHistory', function(req, res, next) {
  res.render('transactionHistory', { title: 'transactionHistory'});
});


router.get('/withdrawMoney', function(req, res, next) {
  res.render('withdrawMoney', { title: 'withdrawMoney', layout: false});
});



module.exports = router;
