const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    name: { type:String, required : true},
    mobile: {type:String, required : true},
    landmark: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, required:true},
  });

const Userschema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    number:{type:Number, required:true},
    password:{type:String, required:true},
    is_blocked:{type:Boolean, default:false},
    is_verified:{type:Number, required:true},
    profilePicture:{type:String},
    address:[addressSchema],
    selectedAddress: {type: mongoose.Schema.Types.ObjectId, ref: 'Address',},
    coupon:{type:Array},
    wallet:{type:Number, default: 0},
    WalletTransaction:{type:Array},
    Referral_Code:{type:String},
})

module.exports = new mongoose.model("User", Userschema)

