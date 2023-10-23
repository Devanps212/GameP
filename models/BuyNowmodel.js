// const mongoose = require('mongoose')

// const purchase = new mongoose.Schema({
//     user:{type: mongoose.Schema.Types.ObjectId,
//           ref:'User'},
//     productItems : [{ 
//         productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
//         image:{type: String},
//         quantity: { type: Number,},
//         total: { type: Number },
//     }]
// })

// module.exports = mongoose.model("BuyNow", purchase)
const mongoose = require('mongoose')

const purchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Example: User reference is required
    },
    productItems: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true, // Example: Product reference is required
        },
        image: {
            type: String,
            required: true, // Example: Image is required
        },
        quantity: {
            type: Number,
            required: true, // Example: Quantity is required
        },
        total: {
            type: Number,
            required: true, // Example: Total is required
        },
    }],
});

module.exports = mongoose.model('Purchase', purchaseSchema);
