var router = require('express').Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads' })
const Account = require('../models/account');
const History = require('../models/history');


// /admin/
router.post('/verifyAccount/:username', async function(req, res, next) {
    await Account.updateOne({ username: req.params.username }, { quyen: 2 })

    res.json({
        isSuccess: true
    })
});

router.post('/requestCMNDUpdate/:username', async function(req, res, next) {
    await Account.updateOne({ username: req.params.username }, { quyen: 3 })

    res.json({
        isSuccess: true
    })
});

router.post('/disableAccount/:username', async function(req, res, next) {
    await Account.updateOne({ username: req.params.username }, { quyen: 4 })

    res.json({
        isSuccess: true
    })
});

router.post('/unlockAccount/:username', async function(req, res, next) {
    await Account.updateOne({ username: req.params.username }, { quyen: 2, loi: 0 })

    res.json({
        isSuccess: true
    })
});


router.post('/appoveTransaction', async function(req, res, next) {
    let maGiaoDich = req.body.maGiaoDich
    let history = await History.findOne({ maGiaoDich })
    let account = await Account.findOne({ sdt: history.sdt })

    if (history.loaiGiaoDich == "Rút tiền") {
        let soDu = Number(account.soDu) - Number(history.tongTien) - Number(history.phi)
        await Account.updateOne({ sdt: history.sdt }, { soDu: soDu })
        await History.updateOne({ maGiaoDich }, { confirm: 1 })
        return res.redirect(`/detailsTransactionHistory/${maGiaoDich}`)
    } 
    else if (history.loaiGiaoDich == "Chuyển tiền") {
        let accountNguoiNhan = await Account.findOne({ sdt: history.sdt2 })

        let soDuNguoiChuyen = Number(account.soDu) - Number(history.tongTien) - Number(history.phi)
        let soDuNguoiNhan = accountNguoiNhan.soDu + history.tongTien
        await Account.updateOne({ sdt: history.sdt }, { soDu: soDuNguoiChuyen})
        await Account.updateOne({ sdt: history.sdt2 }, { soDu: soDuNguoiNhan})
        await History.updateOne({ maGiaoDich }, { confirm: 1 })
        return res.redirect(`/detailsTransactionHistory/${maGiaoDich}`)
    }
    
    else {
        res.redirect('/manageApprovals')
    }
});

router.post('/rejectTransaction', async function(req, res, next) {
    let maGiaoDich = req.body.maGiaoDich

    await History.updateOne({ maGiaoDich }, { confirm: 2 })
    return res.redirect(`/detailsTransactionHistory/${ maGiaoDich }`)
});

module.exports = router;
