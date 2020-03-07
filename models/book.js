var mongoose = require('mongoose')

var book_Schema = new mongoose.Schema({
    "_id": mongoose.Types.ObjectId,
    "OrderId": { type: String, required: true },
    "OrderNo": { type: String, required: true },
    "Name": { type: String, required: true },
    "Quantity": { type: Number, required: true },
    "Paytime": { type: Date, required: true },
    "Receiver": { type: String, required: true },
    "Address": { type: String, required: true },
    "Phone": { type: String, required: true },
    "Price": { type: Number, required: true },
    "Status": { type: String, required: true },
    "TrackingNo": { type: String, required: false }
})

module.exports = mongoose.model('book_collection', book_Schema);