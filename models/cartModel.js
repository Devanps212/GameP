const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"},
    cartItems: [{
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
          image:{type: String},
          quantity: { type: Number,},
          total: { type: Number },
        },
      ],
      cartTotal:{type:Number}
    });
    module.exports = mongoose.model('Cart', cartSchema)
