var router = require('express').Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads' })
const Account = require('../models/account');


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



module.exports = router;
