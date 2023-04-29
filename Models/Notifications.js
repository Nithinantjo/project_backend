const mongoose = require("mongoose");

const NotiSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    products: [
        {
            type: Object,
            properties: {
                product: {
                    type: mongoose.Schema.Types.ObjectId, ref: 'Product'
                },
                amount: {
                    type: Number
                }
            }
        }
    ]
})

module.exports = mongoose.model("Notifications", NotiSchema);