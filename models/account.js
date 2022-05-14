const mongoose = require('mongoose');
const account = new mongoose.Schema({
    sdt: {type: String, unique: true},
    quyen: String, //0 admin,  1 chờ kích hoạt, 2 được kích hoạt, 3 bị hủy 
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
    soDu: { type: Number, default: 0 },
    loi: { type: Number, default: 0 }, //3 loi khoa 1 phut, 6 loi khoa vinh vien
    needResetPassword: { type: Boolean, default: true }, //true => can reset mat khau khi moi tao acc
    timeBeUnlocked: Date, //thoi gian duoc mo khoa (1 phut sau khi sai mk 3 lan)
}, { collection: 'account', versionKey: false });

const accountModel = mongoose.model('account',account);

module.exports = accountModel;

