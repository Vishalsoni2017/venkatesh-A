const mongoose = require('mongoose')

const followSchema = new mongoose.Schema({
    "followedId":{type:'objectId'},
    "authorID":{type:'objectId'}
})

module.exports = new mongoose.model("follows",followSchema)