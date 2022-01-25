require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;


module.exports = db;