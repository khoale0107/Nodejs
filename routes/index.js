var express = require('express');
const { append } = require('express/lib/response');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads' })


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
  let maGiaoDich= Math.random().toString().slice(2, 12);
  res.render('buyCardMobile', { title: 'buyCardMobile',maGiaoDich:maGiaoDich, layout: false});
});

router.post('/detailsTransactionHistory/buyCardMobile/:maGiaoDich',async  function(req, res, next) {

 if(req.body.sdt.length==0)
 {
   mess= "Vui lòng nhập số điện thoại"
   res.render('buyCardMobile', { title: 'buyCardMobile', mess:mess, layout:false});
 }
 else  if(req.body.nhamang=='0')
 {
   mess= "Vui lòng chọn nhà mạng"
   res.render('buyCardMobile', { title: 'buyCardMobile', mess:mess, layout:false});
 }
 else if(req.body.menhgia==0)
 {
   mess= "Vui lòng chọn mệnh giá"
   res.render('buyCardMobile', { title: 'buyCardMobile', mess:mess, layout:false});
 }
 else if(req.body.soluong==0)
 {
   mess= "Vui lòng chọn số lượng thẻ"
   res.render('buyCardMobile', { title: 'buyCardMobile', mess:mess, layout:false});
 }
 else if (req.body.menhgia * req.body.soluong > req.session.user.soDu)
 {
  mess= "Số dư của quí khách không đủ."
  res.render('buyCardMobile', { title: 'buyCardMobile', mess:mess, layout:false});
 }
 else
 {
   
   let maGiaoDich= req.params.maGiaoDich;
   const trans= new historyModel({
                                            maGiaoDich: maGiaoDich,
                                            loaiGiaoDich:"Nạp thẻ điện thoại",
                                            sdt :req.session.user.sdt,
                                            tongTien: req.body.menhgia* req.body.soluong,
                                            tongPhi: req.body.phi,
                                            sdt2: '',
                                            tenChuThe2: ''
                                        })
    trans.save();
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
                  nhaMang: req.body.nhamang,
                  soThe: listCard[i],
                  menhGia: req.body.menhgia
                })
      card.save();

    }
  

    let history = (await historyModel.findOne({maGiaoDich:maGiaoDich})).toObject();
    history.ngay = new Date(history.ngay).toLocaleDateString()
    let cards = await cardModel.find({maGiaoDich:maGiaoDich})
    cards= cards.map(cardModel=>cardModel.toObject())
    console.log(cards);
    accountModel.update({sdt:req.session.user.sdt},{$set: {soDu:  req.session.user.soDu-req.body.menhgia * req.body.soluong}})
  
     res.render('detailsTransactionHistory', { title: 'detailsTransactionHistory', cards:cards,history, layout:false });
                    
 }


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


router.get('/manageAccountList/:username', async function(req, res, next) {
  username = req.params.username;
  let account = await accountModel.findOne({username}).lean()
  
  let isAdmin = req.session.user.quyen == 0 ? true : false
  let isInfinitelyLocked = account.quyen == 5 ? true : false
  
  
  res.render('personalPage', { 
    title: 'personalPage', 
    account, isInfinitelyLocked, isAdmin
  });
});


router.get('/personalPage', async function(req, res, next) {
  let account = req.session.user 
  let needUpdateCMND = req.session.user.quyen == 3 ? true : false

  res.render('personalPage', { title: 'personalPage', account, needUpdateCMND});
});




router.get('/recharge', function(req, res, next) {
  let maGiaoDich= Math.random().toString().slice(2, 12);

  res.render('recharge', { title: 'recharge', layout: false, maGiaoDich:maGiaoDich});
});

router.post('/detailsTransactionHistory/recharge/:maGiaoDich',async  function(req, res, next) {
  if(req.body.sdt.length==0)



  res.render('detailsTransactionHistory', { title: 'detailsTransactionHistory', cards:cards,history, layout:false });
})



router.get('/transactionHistory', function(req, res, next) {
  res.render('transactionHistory', { title: 'transactionHistory'});
});


router.get('/withdrawMoney', function(req, res, next) {
  res.render('withdrawMoney', { title: 'withdrawMoney', layout: false});
});

//cập nhật CMND =======================================================================================
const getIDCardImg = upload.fields([{ name: 'idCardT'}, { name: 'idCardS'}])
router.post('/updateCMND', getIDCardImg, async function(req, res, next) {
  let userFolder = `./public/userResources/${req.session.user.sdt}`
  if (fs.existsSync(userFolder)) {    
    fs.renameSync(req.files.idCardT[0].path, `${userFolder}/${req.session.user.sdt}_MT.png`)
    fs.renameSync(req.files.idCardS[0].path, `${userFolder}/${req.session.user.sdt}_MS.png`)
  }

  await accountModel.updateOne({ username: req.session.user.username }, { quyen: 1 })

  res.redirect('/personalPage')
});

module.exports = router;
