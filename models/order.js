var mongoose = require('mongoose')

var order_Schema = new mongoose.Schema({
    "_id": mongoose.Types.ObjectId,
    "订单Id": { type: String, required: true },
    "订单编号": { type: String, required: true },
    "订单货品和数量": { type: String, required: true },
    "支付时间": { type: Date, required: true },
    "收货人": { type: String, required: true },
    "收货人地址": { type: String, required: true },
    "收货人电话": { type: String, required: true },
    "订单金额": { type: String, required: true },
    "状态": { type: String, required: true },
    "快递单号": { type: Array, required: true },
    "公司": { type: String, required: true }
})

module.exports = mongoose.model('order_collection', order_Schema);