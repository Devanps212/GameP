const mongoose = require('mongoose')

const UpGameSchema = new mongoose.Schema({
    name:{type:String, required:true},
    image:{type:String, required:true},
    validity:{type: Date, default: new Date()},  
})

module.exports = new mongoose.model("Upcoming_Games", UpGameSchema)