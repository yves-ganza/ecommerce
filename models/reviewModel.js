const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    product_id: { type: String,  required: true },
    author: String,
    value: { type: Number, required: true},
    comment: String
});

module.exports = mongoose.model('Review', reviewSchema);