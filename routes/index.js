var express = require('express');
const { append } = require('express/lib/response');
let app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })) ;


var router = express.Router();
var MongoClinet = require('mongodb').MongoClient;

// connect database
const db = require('../config/connect');
db.connect;

// model
const accountModel = require('../models/account');
const historyModel = require('../models/history');
const cardModel = require('../models/card');

/* GET home page. */
router.get('/', function(req, res, next) {  
  res.render('index', { title: 'Trang chủ'});
});
router.get('/index', function(req, res, next) {  
  res.render('index', { title: 'Trang chủ' });
});
router.get('/index.html', function(req, res, next) {  
  res.render('index', { title: 'Trang chủ' });
});


router.get('/transferMoney', function(req, res, next) {
  res.render('transferMoney', { title: 'transferMoney', layout: false,user: req.session.user});
});

router.get('/buyCardMobile', function(req, res, next) {
  res.render('buyCardMobile', { title: 'buyCardMobile', layout: false});
});

router.post('/buyCardMobile', function(req, res, next) {
 // console.log(req.body);
 var sdt,nhamang,menhgia,soluong;
 if(req.body.sdt.length==0)
 {
   mess= "Vui lòng nhập số điện thoại"
 }
 else  if(req.body.nhamang=='0')
 {
   mess= "Vui lòng nhập số điện thoại"
 }
 if(req.body.sdt.menhgia=='0')
 {
   mess= "Vui lòng nhập số điện thoại"
 }
 if(req.body.sdt.soluong=='0')
 {
   mess= "Vui lòng nhập số điện thoại"
 }
 else
 {
   let maGiaoDich= Math.random().toString().slice(2, 12);
   const transaction = new historyModel({
                                            maGiaoDich: maGiaoDich,
                                            loaiGiaoDich:"Nạp thẻ điện thoại",
                                            sdt :req.session.user.sdt,
                                            tongTien: req.body.menhgia* req.body.soluong,
                                            tongPhi: req.body.phi,
                                            sdt2: '',
                                            tenChuThe2: ''
                                        })
  transaction.save();
  let mathe = '';
  if( req.body.nhamang=='Viettel')
  {
    mathe= '11111'
  }
  else  if( req.body.nhamang=='VinaPhone')
  {
    mathe='22222'
  }
  else
  {
    mathe ='333333'
  }
  
  var listCard=  new Array( req.body.soluong)

  for(var i=0; i< req.body.soluong; i++){
    listCard[i]= mathe+Math.random().toString().slice(2, 7);
    const card = new cardModel( 
              { maGiaoDich: maGiaoDich,
                nhaMang:req.body.nhamang,
                soThe:listCard[i],
                menhgia: req.body.menhgia
              })
    card.save();

  }
  mess= "Giao dịch thành công"


                                        
 }

 res.render('buyCardMobile', { title: 'buyCardMobile', mess:mess, layout: false});
});


router.get('/manageApprovals', async function(req, res, next) {
  let historys = await historyModel.find()
  historys= historys.map(historyModel=>historyModel.toObject())
  res.render('manageApprovals', { title: 'manageApprovals',historys:historys});
});


router.get('/manageApprovals/:maGiaoDich', async function(req, res, next) {  
  let ma = req.params.maGiaoDich;
  let history = (await historyModel.findOne({maGiaoDich:ma})).toObject();
  history.ngay = new Date(history.ngay).toLocaleDateString()
  res.render('detailsTransactionHistory', { title: 'detailsTransactionHistory',history:history,layout:false});
});


router.get('/manageAccountList', async function(req, res, next) {
  let accounts = await accountModel.find()
  accounts = accounts.map(accountModel=>accountModel.toObject())   
  res.render('manageAccountList', {title: 'manageAccountList', accounts: accounts})

});


router.get('/manageAccountList/:userName', async function(req, res, next) {
  userName= req.params.userName;

  let account = (await accountModel.findOne({userName:userName})).toObject();
  res.render('personalPage', { title: 'personalPage',account:account});


});


router.get('/personalPage',  function(req, res, next) {

  res.render('personalPage', { title: 'personalPage',account:req.session.user});
});




router.get('/recharge', function(req, res, next) {
  res.render('recharge', { title: 'recharge', layout: false});
});



router.get('/transactionHistory', function(req, res, next) {
  res.render('transactionHistory', { title: 'transactionHistory'});
});


router.get('/withdrawMoney', function(req, res, next) {
  res.render('withdrawMoney', { title: 'withdrawMoney', layout: false});
});



module.exports = router;
