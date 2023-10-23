const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: [
      {
        productId: {type: mongoose.Schema.Types.ObjectId, ref: "Products" },
        name:{type:String},
        image:{type: String},
        stock: { type: Number},
        price: { type: Number},
      },
    ],
  });
  

module.exports = mongoose.model("Wishlist", wishlistSchema)