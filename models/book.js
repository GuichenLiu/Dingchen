var mongoose = require('mongoose')

var book_Schema = new mongoose.Schema({
    "_id": mongoose.Types.ObjectId,
    "书名": { type: String, required: true },
    "公司": { type: String, required: true },
    "菁韵价": { type: Number, required: true },
    "书卡价": { type: Number, required: true },
    "码洋": { type: Number, required: true },
    "销售价": { type: Number, required: true }
})

module.exports = mongoose.model('book_collection', book_Schema);