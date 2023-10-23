const mongoose = require('mongoose')

const BannerSchema = new mongoose.Schema({
    title:{type:String, required:true},
    image:{type:String},
    productId:{type:mongoose.Schema.Types.ObjectId, ref:'Products'},
    listed:{type:Boolean, default:true}
})

module.exports = new mongoose.model("Banner", BannerSchema)
