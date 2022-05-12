const mongoose = require('mongoose');
const account = new mongoose.Schema({
    sdt: {type: String, unique: true},
    quyen: String,
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
    soDu: Number,
    loi: { type: Number, default: -1 },

}, { collection: 'account', versionKey: false });

const accountModel = mongoose.model('account',account);

module.exports = accountModel;

