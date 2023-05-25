const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: String,
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
        {type: Object,
        properties:
        {
            email: {
                type: String
            },
            count: {
                type: Number
            }
        }}
    ]
});

module.exports = mongoose.model("Product", ProductSchema);