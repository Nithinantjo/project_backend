const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true,
        trim: true,
    },
    carted: [
        {type: String}
    ]
});

module.exports = mongoose.model("Product", ProductSchema);