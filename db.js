const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')
const MongoClient = require('mongodb').MongoClient;

dotenv.config();

const url = process.env.URL;

mongoose.connect(url).then((mongoose)=>{
    console.log("DB connected")
    app.listen(3003,()=>{
        console.log("Server running at 3003")
    })
})



module.exports = mongoose;

