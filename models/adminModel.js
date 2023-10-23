const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    description:{type:String},
    company:{type:String},
    job:{type:String},
    country:{type:String},
    address:{type:String},
    phone:{type:Number},
    image:{type:String}
})

module.exports = mongoose.model("admins", adminSchema)