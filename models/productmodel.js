const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name:{type:String, required:true},
    description:{type:String, required:true},
    image:{type:Array},
    category:{type:String, ref:'category', required:true},
    price:{type:Number, required:true},
    offerprice:{type:Number, required:true},
    stock:{type:Number, required:true},
    is_listed:{type:Boolean, default:true},
    is_blocked:{type:Boolean, default:false}

})

const product = mongoose.model('Products', productSchema)

module.exports =product