const mongoose = require('mongoose');

const card = new mongoose.Schema({
    maGiaoDich: String,
    nhaMang: String,
    soThe: String,
    menhGia: Number,
}, 
{ collection: 'card', versionKey: false });

const cardModel = mongoose.model('card',card);

module.exports = cardModel;
