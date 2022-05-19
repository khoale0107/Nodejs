const mongoose = require('mongoose');
const account = new mongoose.Schema({
    sdt: {type: String, unique: true},
    //0 admin,  1 chờ xác minh, 2 được xác minh, 3 chờ cập nhật, 4 bị vô hiệu hóa, 5 khóa vô hạn
    quyen: { type: Number, default: 1 }, 
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

