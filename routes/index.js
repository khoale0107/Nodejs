var express = require('express');
const { append, render } = require('express/lib/response');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads' })
const { check, validationResult } = require('express-validator');


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




router.get('/manageApprovals', async function(req, res, next) {
  let historys = await historyModel.find()
  historys= historys.map(historyModel=>historyModel.toObject())
  res.render('manageApprovals', { title: 'manageApprovals',historys:historys});
});

router.post('/manageApprovals', async function(req, res, next) {
  if (req.body.Wait !=null)
  {
    let historys = await historyModel.find({confirm:0})
    historys= historys.map(historyModel=>historyModel.toObject())
    res.render('manageApprovals', { title: 'manageApprovals',historys:historys});
  }
  else  if (req.body.Agree !=null)
  {
    let historys = await historyModel.find({confirm:1})
    historys= historys.map(historyModel=>historyModel.toObject())
    res.render('manageApprovals', { title: 'manageApprovals',historys:historys});
  }
  else  if (req.body.Resuse !=null)
  {
    let historys = await historyModel.find({confirm:2})
    historys= historys.map(historyModel=>historyModel.toObject())
    res.render('manageApprovals', { title: 'manageApprovals',historys:historys});
  }
  else  if (req.body.All !=null)
  {
    let historys = await historyModel.find()
    historys= historys.map(historyModel=>historyModel.toObject())
    res.render('manageApprovals', { title: 'manageApprovals',historys:historys});
  }



});



// router.get('/manageApprovals/:maGiaoDich', async function(req, res, next) {  
//   let ma = req.params.maGiaoDich;
//   let history = (await historyModel.findOne({maGiaoDich:ma})).toObject();
//   history.ngay = new Date(history.ngay).toLocaleDateString()
//   res.render('detailsTransactionHistory', { title: 'detailsTransactionHistory',history:history,layout:false});
// });


router.get('/manageAccountList', async function(req, res, next) {
  let accounts = await accountModel.find()
  accounts = accounts.map(accountModel=>accountModel.toObject())   
  res.render('manageAccountList', {title: 'manageAccountList', accounts: accounts})

});

router.post('/manageAccountList', async function(req, res, next) {
  console.log("loc")
  console.log(req.body)

  if (req.body.All !=null)
  {
    let accounts = await accountModel.find()
    accounts = accounts.map(accountModel=>accountModel.toObject())   
    res.render('manageAccountList', {title: 'manageAccountList', accounts: accounts})
  }
  else if  (req.body.Not !=null)
  {
    let accounts = await accountModel.find({quyen:1})
    accounts = accounts.map(accountModel=>accountModel.toObject())   
    res.render('manageAccountList', {title: 'manageAccountList', accounts: accounts})
  }
  else if  (req.body.Activated !=null)
  {
    let accounts = await accountModel.find({quyen:2})
    accounts = accounts.map(accountModel=>accountModel.toObject())   
    res.render('manageAccountList', {title: 'manageAccountList', accounts: accounts})
  }
  else if  (req.body.Wait!=null)
  {
    let accounts = await accountModel.find({quyen:3})
    accounts = accounts.map(accountModel=>accountModel.toObject())   
    res.render('manageAccountList', {title: 'manageAccountList', accounts: accounts})
  }
  else if  (req.body.Disabled !=null)
  {
    let accounts = await accountModel.find({quyen:4})
    accounts = accounts.map(accountModel=>accountModel.toObject())   
    res.render('manageAccountList', {title: 'manageAccountList', accounts: accounts})
  }
  else if  (req.body.lock !=null)
  {
    let accounts = await accountModel.find({quyen:5})
    accounts = accounts.map(accountModel=>accountModel.toObject())   
    res.render('manageAccountList', {title: 'manageAccountList', accounts: accounts})
  }
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



//-------------------- START NẠP TIỀN-------------------------------------
const checkReChargeValidators = [
  check('sothe')
    .exists().withMessage('Missing sothe field')
    .notEmpty().withMessage('Hãy nhập số thể'),
  check('maCCV')
    .exists().withMessage('Missing maCCV field')
    .notEmpty().withMessage('Vui lòng nhập mã CCV'),

  check('ngayhethan')
    .exists().withMessage('Missing ngayhethan field')
    .notEmpty().withMessage('Vui lòng chọn ngày hết hạn'),

  check('sotien')
    .exists().withMessage('Missing sotien field')
    .notEmpty().withMessage('Vui lòng nhập sotien'),

]

router.get('/recharge', function(req, res, next) {
  let msg = ''|| req.flash('msg')
  let maGiaoDich= Math.random().toString().slice(2, 12) ||req.flash('maGiaoDich');
  let sothe = ''|| req.flash('sothe')
  let maCCV = ''|| req.flash('maCCV')
  let ngayhethan = ''|| req.flash('ngayhethan')
  let sotien = ''|| req.flash('sotien')
  res.render('recharge', { title: 'recharge', layout: false,msg,maGiaoDich,sothe,maCCV,ngayhethan,  maGiaoDich,sotien});
});

router.post('/recharge',checkReChargeValidators,async  function(req, res, next) {
 let results =  validationResult(req);
 if (results.errors.length > 0) {
  req.flash('msg', results.errors[0].msg)
  req.flash('maGiaoDich',req.body.maGiaoDich)
  req.flash('sothe',req.body.sothe)
  req.flash('maCCV', req.body.maCCV)
  req.flash('ngayhethan',req.body.ngayhethan)
  req.flash('sotien', req.body.sotien)
  return res.redirect('recharge');
}

if (req.body.sothe == "111111" ||req.body.sothe == "222222"||req.body.sothe == "333333")
{
  if (req.body.sothe == "111111" )
  {
      if( req.body.maCCV != '411')
      {
        req.flash('msg','Mã CCV không chính xác');
        return res.redirect('recharge');
      }
      
      else if(req.body.ngayhethan!= '2022-10-10')
      {
        req.flash('msg','Ngày hết hạn không chính xác');
        return res.redirect('recharge');
      }
    }
    
    else if (req.body.sothe == "222222" )
    {
      if( req.body.maCCV != '443')
      {
        req.flash('msg','Mã CCV không chính xác');
        return res.redirect('recharge');
      }
      
      else if(req.body.ngayhethan!= '2022-11-11')
      {
        req.flash('msg','Ngày hết hạn không chính xác');
        return res.redirect('recharge');
      }
      else if( req.body.sotien> 1000000)
      {
        req.flash('msg','Thẻ chỉ được nạp tối đa 1 triệu/ lần');
        return res.redirect('recharge');
      }

    }

    
    else if (req.body.sothe == "333333" )
    {
        if( req.body.maCCV != '577')
        {
          req.flash('msg','Mã CCV không chính xác');
          return res.redirect('recharge');
        }
        
        else if(req.body.ngayhethan!= '2022-12-12')
        {
          req.flash('msg','Ngày hết hạn không chính xác');
          return res.redirect('recharge');
        }
        else
        {
          
            req.flash('msg','Thẻ không đủ số dư ');
            return res.redirect('recharge');
        }

    }
}
else{
  req.flash('msg','thẻ này không được hỗ trợ');
  return res.redirect('recharge');
}
const trans= new historyModel({
  maGiaoDich: req.body.maGiaoDich,
  loaiGiaoDich:"Nạp tiền",
  sdt :req.session.user.sdt,
  tongTien: req.body.sotien,
  tongPhi: req.body.phi,
  maATM: req.body.sothe,
  phi:0,
  confirm: 1,
  anh: 'img/product-2.png'
})
trans.save(
err => {
  if (err) {

  console.log('Can not add new task because ' + err);
  }
  else {
    let url = '/detailsTransactionHistory/'+req.body.maGiaoDich;
    return res.redirect(url);
  }
  });

let soDu = Number(req.session.user.soDu) + Number(req.body.sotien)
await accountModel.updateOne({sdt:req.session.user.sdt}, { soDu: soDu})



});
//-------------------- END NẠP TIỀN-------------------------------------

//-------------------- START RÚT TIỀN-------------------------------------

const withdrawMoneycheckValidators = [
  check('soThe')
    .exists().withMessage('Missing sothe field')
    .notEmpty().withMessage('Hãy nhập số thẻ'),
  check('maCCV')
    .exists().withMessage('Missing maCCV field')
    .notEmpty().withMessage('Vui lòng nhập mã CCV'),

  check('ngayHetHan')
    .exists().withMessage('Missing ngayhethan field')
    .notEmpty().withMessage('Vui lòng chọn ngày hết hạn'),

  check('soTien')
    .exists().withMessage('Missing sotien field')
    .notEmpty().withMessage('Vui lòng nhập số tiền'),

]


router.get('/withdrawMoney',async function(req, res, next) {
  let myhistory = await historyModel.find({sdt:req.session.user.sdt,loaiGiaoDich:'Rút tiền'});
  let count =0
  for (let product of myhistory){
    if(((product.ngay).toLocaleDateString())==((new Date()).toLocaleDateString()))
    {
      count= count+1
    }
  }
  let soLuot = 2- count
  let msg = ''|| req.flash('msg')
  let maGiaoDich = Math.random().toString().slice(2, 12) ||req.flash('maGiaoDich');
  let soThe = ''|| req.flash('soThe')
  let maCCV = ''|| req.flash('maCCV')
  let ngayHetHan = ''|| req.flash('ngayhethan')
  let soTien = ''|| req.flash('sotien')
  let phi = ''|| req.flash('phi')
  let note = '' || req.flash('note')

  
  res.render('withdrawMoney', { title: 'withdrawMoney', layout: false,msg,maGiaoDich,soThe,maCCV,ngayHetHan,soTien,phi,note,soLuot});
});


router.post('/withdrawMoney', withdrawMoneycheckValidators,async  function(req, res, next) {
  let results =  validationResult(req);
  req.flash('maGiaoDich',req.body.maGiaoDich)
  req.flash('soThe',req.body.soThe)
  req.flash('maCCV', req.body.maCCV)
  req.flash('ngayHetHan',req.body.ngayHetHan)
  req.flash('soTien', req.body.soTien)
  req.flash('phi', req.body.phi)
  req.flash('note', req.body.note)
  if (results.errors.length > 0) {
    req.flash('msg', results.errors[0].msg)
     return res.redirect('withdrawMoney');
 }
 if( req.body.soThe=='111111')
 {
    if(req.body.maCCV!='411')
    {
      req.flash('msg',"Mã CCV không đúng")
      return res.redirect('withdrawMoney');
    }
    else if (req.body.ngayHetHan!='2022-10-10')
    {
      req.flash('msg',"Ngày hết hạn không đúng")
      return res.redirect('withdrawMoney');
    }
    else if(Number(req.body.soTien)+Number(req.body.phi)>Number(req.session.user.soDu))
    {
      req.flash('msg',"Số dư trong tài khoản không đủ để rút")
      return res.redirect('withdrawMoney');
    }
 }
 else
 {
  req.flash('msg',"Thẻ không được hỗ trợ rút tiền")
  return res.redirect('withdrawMoney');
 }
 let myhistory = await historyModel.find({sdt:req.session.user.sdt,loaiGiaoDich:'Rút tiền'});
 let count =0
 for (let product of myhistory){
   if(((product.ngay).toLocaleDateString())==((new Date()).toLocaleDateString()))
   {
     count= count+1
   }
 }
 if( count>=2)
 {
  req.flash('msg',"Bạn đã hết lượt rút tiền hôm nay")
  return res.redirect('withdrawMoney');
 }
 
 let trangthai=1
 if(Number(req.body.soTien>=5000000))
 {
   trangthai= 0;
 }
 else 
 {
  let soDu = Number(req.session.user.soDu) - Number(req.body.soTien) - Number(req.body.soTien)*(5/100);
  await accountModel.updateOne({sdt:req.session.user.sdt}, { soDu: soDu})
 }
 
 let phi = req.body.soTien*(5/100);
 const trans= new historyModel({
  maGiaoDich: req.body.maGiaoDich,
  loaiGiaoDich:"Rút tiền",
  sdt :req.session.user.sdt,
  tongTien: req.body.soTien,
  maATM: req.body.soThe,
  phi:phi,
  confirm: trangthai,
  note: req.body.note,
  anh:'img/product-3.jpg'
})
console.log(trans)

trans.save(
err => {
  if (err) {

  console.log('Can not add new task because ' + err);
  }
  else {
    let url = '/detailsTransactionHistory/'+req.body.maGiaoDich;
    return res.redirect(url);
  }
  });

})

//-------------------- END RÚT TIỀN-------------------------------------

//-------------------- START CHUYỂN TIỀN--------------------------------
const transferMoneycheckValidators = [
  check('sdtNhan')
    .exists().withMessage('Missing sothe field')
    .notEmpty().withMessage('Hãy nhập số điện thoại người nhận'),
  check('soTien')
    .exists().withMessage('Missing maCCV field')
    .notEmpty().withMessage('Vui lòng nhập số tiền muốn gửi'),
]

router.get('/transferMoney', async function(req, res, next) {
  let msg = ''|| req.flash('msg')
  let maGiaoDich = Math.random().toString().slice(2, 12) ||req.flash('maGiaoDich');
  let sdtNhan = '' ||  req.flash('sdtNhan')
  let soTien = ''|| req.flash('soTien')
  // let phi = ''|| req.flash('phi')
  let note = '' || req.flash('note')
  res.render('transferMoney', { title: 'transferMoney', layout: false,msg,maGiaoDich,sdtNhan,soTien,note});
});

router.post('/transferMoney', transferMoneycheckValidators, async function(req, res, next) { 
  req.flash('maGiaoDich',req.body.maGiaoDich)
  req.flash('soTien', req.body.soTien)
  req.flash('sdtNhan', req.body.sdtNhan)
  req.flash('note', req.body.note)

  let results =  validationResult(req);
  if (results.errors.length > 0) {
    req.flash('msg', results.errors[0].msg)
     return res.redirect('transferMoney');
 }
 let user2 = await accountModel.findOne({sdt:req.body.sdtNhan})
 if (user2== null)
 {
    req.flash('msg',"Số điện thoại chưa đăng kí tài khoản")
    return res.redirect('transferMoney');
 }
 if(req.body.chiuPhi=="nhan")
 {
   if (Number(req.session.user.soDu) < Number(req.body.soTien))
   {
    req.flash('msg',"Số dư quý khách không đủ thực hiện giao dịch")
    return res.redirect('transferMoney');
   }
 }
 else
 {
  if (Number(req.session.user.soDu) < Number(req.body.soTien)+ (Number(req.body.soTien)*5/100))
  {
   req.flash('msg',"Số dư quý khách không đủ thực hiện giao dịch")
   return res.redirect('transferMoney');
  }
 }

  let trangthai=1
  if(Number(req.body.soTien>=5000000))
  {
    trangthai= 0;
  }
  else 
  {
    if ( req.body.chiuPhi=='nhan') // chịu phí bên nhận
    {
      // bên gửi
      let soDuGui = Number(req.session.user.soDu) - Number(req.body.soTien);
      await accountModel.updateOne({sdt:req.session.user.sdt}, { soDu: soDuGui})
      // bên nhận
      let soDuNhan = Number(user2.soDu) + Number(req.body.soTien) - Number(req.body.soTien)*(5/100);
      await accountModel.updateOne({sdt:req.body.sdtNhan}, { soDu: soDuNhan})
    }
    else // chịu phí bên gửi
    {
      // bên gửi
      let soDuGui = Number(req.session.user.soDu) - Number(req.body.soTien)- Number(req.body.soTien)*(5/100);
      await accountModel.updateOne({sdt:req.session.user.sdt}, { soDu: soDuGui})
      // bên nhận
      let soDuNhan = Number(user2.soDu) + Number(req.body.soTien) ;
      await accountModel.updateOne({sdt:req.body.sdtNhan}, { soDu: soDuNhan})
    }
    

   
  }
  let phi = req.body.soTien*(5/100);
  let chiuLePhi ='Bên gửi';
  if ( req.body.chiuPhi=='nhan')
  {
     chiuLePhi= 'Bên nhận'
  }
  
 
  const trans= new historyModel({
  maGiaoDich: req.body.maGiaoDich,
  loaiGiaoDich:"Chuyển tiền",
  sdt :req.session.user.sdt,
  sdt2: req.body.sdtNhan,
  tongTien: req.body.soTien,
  phi:phi,
  confirm: trangthai,
  note: req.body.note,
  anh:'img/product-3.png'
 })
 console.log(trans)
 
 trans.save(
 err => {
   if (err) {
 
   console.log('Can not add new task because ' + err);
   }
   else {
     let url = '/detailsTransactionHistory/'+req.body.maGiaoDich;
     return res.redirect(url);
   }
   });

   




})
//-------------------- END CHUYỂN TIỀN--------------------------------


//-------------------- START MUA CARD ĐIỆN THOẠI-----------------------

const buyMobileCardcheckValidators = [
  check('nhaMang')
    .exists().withMessage('Missing sothe field')
    .notEmpty().withMessage('Vui lòng chọn nhà mạng'),
  
  check('menhGia')
    .exists().withMessage('Missing maCCV field')
    .notEmpty().withMessage('Vui lòng chọn mệnh giá'),
  check('soLuong')
    .exists().withMessage('Missing maCCV field')
    .notEmpty().withMessage('Vui lòng nhập số lượng'),
]

router.get('/buyCardMobile', async function(req, res, next) {
  let maGiaoDich = Math.random().toString().slice(2, 12) ||req.flash('maGiaoDich');
  let msg = ''|| req.flash('msg')
  console.log("Thông báo:"+msg)

  res.render('buyCardMobile', { title: 'buyCardMobile', msg, maGiaoDich,layout: false});
});

router.post('/buyCardMobile', buyMobileCardcheckValidators, async function(req, res, next) {  
 
  console.log(req.body)
  let results =  validationResult(req);
  if (results.errors.length > 0) {
    req.flash('msg', results.errors[0].msg)
     return res.redirect('buyCardMobile');
 }
 if(req.session.user.soDu< Number(req.menhGia)* Number(req.soLuong))
 {
  req.flash('msg',"Số dư trong tài khoản không đủ")
  return res.redirect('buyCardMobile');
 }
 
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
 
 soDu = Number(req.session.user.soDu)- Number(req.body.soLuong)* Number(req.body.menhGia) 
 await accountModel.updateOne({sdt:req.session.user.sdt}, {soDu})

 var listCard=  new Array( req.body.soLuong)
 for(var i=0; i< req.body.soLuong; i++){
   listCard[i]= mathe+Math.random().toString().slice(2, 7);
   const card = new cardModel( 
             { maGiaoDich: req.body.maGiaoDich,
               nhaMang: req.body.nhaMang,
               soThe: listCard[i],
               menhGia: req.body.menhGia
             })
   card.save();
   console.log(card);
 }

 const trans= new historyModel({
  maGiaoDich: req.body.maGiaoDich,
  loaiGiaoDich:"Mua card điện thoại",
  sdt :req.session.user.sdt,
  tongTien: Number(req.body.soLuong)* Number(req.body.menhGia), 
  phi:0,
  confirm: 1,
  anh:'img/product-4.png'
 })
 console.log(trans)
 
 trans.save(
 err => {
   if (err) {
 
   console.log('Can not add new task because ' + err);
   }
   else {
     let url = '/detailsTransactionHistory/'+req.body.maGiaoDich;
     return res.redirect(url);
   }
   });
})

//-------------------- END MUA CARD ĐIỆN THOẠI-------------------------



router.get('/detailsTransactionHistory/:maGiaoDich', async function(req, res, next) {
  
  maGiaoDich = req.params.maGiaoDich;
  let TrangThai,color;
  let history = (await historyModel.findOne({maGiaoDich})).toObject();

  if(history.sdt2!=null)
  {
    if((history.sdt!= req.session.user.sdt&&history.sdt2!= req.session.user.sdt))
    {
      res.render('error', { });
    }
  }
  else
  {
    if((history.sdt!= req.session.user.sdt))
    {
      res.render('error', { });
    }
  }
  
  if(history.confirm==0)
  {
    TrangThai =  "Chờ duyệt"
    color = 'warning'
  }
  else if(history.confirm==1)
  {
    TrangThai =  'Giao dịch thành công'
    color = 'success'

  }
  else
  {
    TrangThai =  'Giao dịch thất bại'
    color = 'danger'
  }
  let tenNguoiNhan ='';

  
  if(history.sdt2 !=null)
  {
    let user2 = await accountModel.findOne({sdt:history.sdt2})
    tenNguoiNhan = user2.tenNguoiDung;
  }
  
  let   cards = await cardModel.find({maGiaoDich:history.maGiaoDich})
  cards= cards.map(cardModel=>cardModel.toObject())



  


  res.render('detailsTransactionHistory', { title: 'recharge', layout: false,TrangThai,history,color,tenNguoiNhan, cards});
});







router.get('/transactionHistory', async  function(req, res, next) {
  let historys = await historyModel.find({sdt: req.session.user.sdt})
  historys= historys.map(historyModel=>historyModel.toObject())
  historys.ngay = new Date(historys.ngay).toLocaleDateString()
  res.render('transactionHistory', { title: 'transactionHistory', historys});
});

router.get('/transactionHistory/recharge', async  function(req, res, next) {
  let historys = await historyModel.find({sdt: req.session.user.sdt,loaiGiaoDich:"Nạp tiền"})
  historys= historys.map(historyModel=>historyModel.toObject())
  historys.ngay = new Date(historys.ngay).toLocaleDateString()
  res.render('transactionHistory', { title: 'transactionHistory', historys});
});
router.get('/transactionHistory/transferMoney', async  function(req, res, next) {
  let historys = await historyModel.find({sdt: req.session.user.sdt,loaiGiaoDich:"Chuyển tiền"})
  historys= historys.map(historyModel=>historyModel.toObject())
  historys.ngay = new Date(historys.ngay).toLocaleDateString()
  res.render('transactionHistory', { title: 'transactionHistory', historys});
});
router.get('/transactionHistory/withdrawMoney', async  function(req, res, next) {
  let historys = await historyModel.find({sdt: req.session.user.sdt,loaiGiaoDich:"Rút tiền"})
  historys= historys.map(historyModel=>historyModel.toObject())
  historys.ngay = new Date(historys.ngay).toLocaleDateString()
  res.render('transactionHistory', { title: 'transactionHistory', historys});
});
router.get('/transactionHistory/buyCardMobile', async  function(req, res, next) {
  let historys = await historyModel.find({sdt: req.session.user.sdt,loaiGiaoDich:"Mua card điện thoại"})
  historys= historys.map(historyModel=>historyModel.toObject())
  historys.ngay = new Date(historys.ngay).toLocaleDateString()
  res.render('transactionHistory', { title: 'transactionHistory', historys});
});

router.get('/transactionHistory/receiveMoney', async  function(req, res, next) {
  let historys = await historyModel.find({sdt2: req.session.user.sdt})
  historys= historys.map(historyModel=>historyModel.toObject())
  historys.ngay = new Date(historys.ngay).toLocaleDateString()
  res.render('transactionHistory', { title: 'transactionHistory', historys});
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
