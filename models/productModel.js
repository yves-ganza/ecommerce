const mongoose = require('mongoose');

const Schema = mongoose.Schema

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    dimensions: { x: Number, y: Number, z: Number},
    stock: { type: Number, default: 0 }
}, { timestamps: true});

module.exports = mongoose.model('Product', productSchema);