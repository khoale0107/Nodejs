// require the library
const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb+srv://lowji32101:lowji32101@cluster0.qvhymtn.mongodb.net/CK');
// aquire the connection (to check if it is successful)
const connect = mongoose.connection;
// error
connect.on('error', console.error.bind(console, 'Error connecting to MongoDB Atlas!'));
// up and running then print the message
connect.once('open', function () { console.log('Connected to MongoDB Atlas!'); });
// exporting the database
module.exports = connect;