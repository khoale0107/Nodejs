const mongoose = require('mongoose');
const account = new mongoose.Schema({
    stk: String,
    sdt: String,
    permit: String,
    userName: String,
    tenNguoiDung: String,
    ngaySinh: Date,
    queQuan: String,
    matTruocCMND: String,
    matSauCMND: String,
    anhDaiDien: String,
    email: String,
    ngayMoThe: String,
}, { collection: 'account', versionKey: false });

const accountModel = mongoose.model('account',account);

module.exports = accountModel;