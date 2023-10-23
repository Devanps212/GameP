const mongoose = require('mongoose')



const contactSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    subject:{type:String, required:true},
    messages: [
        {
          message: { type: String },
          date: { type: Date, default: Date.now }
        }
      ]
})

module.exports = new mongoose.model("Contact", contactSchema)