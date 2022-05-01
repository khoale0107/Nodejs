const mongoose = require('mongoose');
const account = new mongoose.Schema({
    sdt: {type: String, unique: true},
    permit: String,
    username: String,
    password: String,
    tenNguoiDung: String,
    ngaySinh: String,
    diaChi: String,
    matTruocCMND: String,
    matSauCMND: String,
    anhDaiDien: String,
    email: {type: String, unique: true},
    ngayMoThe: String,
    soDu: Number
}, { collection: 'account', versionKey: false });

const accountModel = mongoose.model('account',account);

module.exports = accountModel;