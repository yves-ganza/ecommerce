const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    author: { type: String, required: true},
    products: [{product_name: String, product_id: String, quantity: Number}]
}, { timestamps: true});


module.exports = mongoose.model('Order', orderSchema);