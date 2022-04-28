const mongoose = require('mongoose');
const account = new mongoose.Schema({
    
    sdt: String,
    permit: String,
    userName: String,
    passwork: String,
    tenNguoiDung: String,
    ngaySinh: String,
    queQuan: String,
    matTruocCMND: String,
    matSauCMND: String,
    anhDaiDien: String,
    email: String,
    ngayMoThe: String,
    soDu: Number
}, { collection: 'account', versionKey: false });

const accountModel = mongoose.model('account',account);

module.exports = accountModel;