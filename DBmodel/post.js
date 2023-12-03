const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    "title":String,
    "body":String,
    "createdDate":String,
    "author":{type:'objectId'}
});

module.exports = new mongoose.model("posts",postSchema);