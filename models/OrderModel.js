const mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    items:[
        {productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Products',
            required:true,
        },
        quantity:{
            type:Number,
            required:true,
        },
        total: {
            type: Number,
            required: true,
          },
        image:{type: String},
       },
    ],
    total:{
        type:Number,
        required:true,
    },
    paymentMethod:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:['Pending', 'Processing', 'Shipped', 'Delivered', 'CANCELLED', 'Wallet', 'Return-Req', 'Return Accepted', "Return-Declined", 'Return-Completed'],
        default:'Pending'
    },
    onlinePaymentStatus:{
        type:String,
        enum:['Failed','success'],
        default:'success'
    
      },
    Date:{type:Date, default:Date.now},

})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order