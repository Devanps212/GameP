const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name:{type:String, required:false, unique:true},
    listed:{type:Boolean, default:true}
})

module.exports = mongoose.model('category', categorySchema)