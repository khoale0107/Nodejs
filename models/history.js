const mongoose = require('mongoose');

const history = new mongoose.Schema({
    maGiaoDich: String,
    loaiGiaoDich: String,
    sdt: String,
    tongTien: Number,
    ngay: {type: Date, default: Date.now},
    tongPhi: Number,
    sdt2: String,
    tenChuThe2: String,
    phi: Number,
    confirm: Number, //  0 chờ duyệt, 1 đồng ý, 2 từ chối
    maATM: String,
    note: String,
    chiuPhi: String,
    anh: String
}, { collection: 'history', versionKey: false });

const historyModel = mongoose.model('history',history);

module.exports = historyModel;