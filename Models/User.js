const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        // lowercase: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    cart: 
    
    [
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
    ],
    myorders: 
    
    
    [    {
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
});


module.exports = mongoose.model("User", UserSchema);