require('dotenv').config();
const express = require('express')
const app = express();
const PORT = process.env.PORT || 5000;

const cors = require('cors');

const db = require('./db');
const userAuth = require('./routes/userAuth');
db.on('error', err => console.error(err));
db.once('open', () => console.log("Connected to the database succesfully"));
// middlewares

app.use(cors());
app.use(express.json());



//routes
app.use("/", userAuth);










// listen 
app.listen(PORT, () => {
    console.log(`Listening on Port : ${PORT}`);
})