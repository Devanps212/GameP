const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId, ref:'User', required:true},
    productId:{type:mongoose.Types.ObjectId, required:true},
    title:{type:String, required:true},
    review:{type:String, required:true},
    image:{type:Array, required:true}
})

module.exports = new mongoose.model("Review", reviewSchema)