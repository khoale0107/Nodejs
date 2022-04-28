// require the library
const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/CK');
// aquire the connection (to check if it is successful)
const connect = mongoose.connection;
// error
connect.on('error', console.error.bind(console, 'Lỗi kết nối đến cở sở dữ liệu!'));
// up and running then print the message
connect.once('open', function () { console.log('Kết nối cơ sở dữ liệu thành công!'); });
// exporting the database
module.exports = connect;