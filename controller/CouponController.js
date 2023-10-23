const Coupon = require('../models/CouponModel')
const mongoose = require('mongoose')
const CouponGenerator = require('voucher-code-generator')
const User = require('../models/UserModel')
const Cart = require('../models/cartModel')



const couponManagement = async(req, res)=>
{
    try
    {
        const adminProfile = req.adminProfile;
        const coupons = await Coupon.find()
        res.render('CouponList',{coupons, adminProfile})
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const addCoupon = async(req, res)=>
{
    try
    {
        res.render('AddCoupon')
    }
    catch(error)
    {
        console.log(error.message)
    }
}

const couponPost = async(req, res)=>
{
    try
    {
        console.log("Coupon received")
       const {couponCode, validity, minAmount, discount, maxDiscount, description} = req.body

       const coupon = new Coupon({
        couponCode: couponCode,
        validity: validity,
        minPurchase: minAmount, 
        minDiscountPercentage: discount, 
        maxDiscountValue: maxDiscount,
        description: description,
       })

       await coupon.save()
       res.json({status: true})
    }
    catch(error)
    {
        console.error(error);
        res.json({ status: false })
    }
}
const generateCoupon = async(req, res)=>
{
    console.log("Coupon generating")
    try
    {
        const generatedCoupon = CouponGenerator.generate({
            length: 6,
            count:1,
            charset:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            prefix:"GAMPro",
        })

        console.log(generatedCoupon)

        res.send({status:true,couponcode:generatedCoupon[0]})
        
    }
    catch(error)
    {
        console.error(error);
        res.status(500).send("Error generating coupon code");
    }
}
const deleteCoupon = async (req, res) => {
    try {
      const couponId = req.query.id;
      const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
  
      if (!deletedCoupon) {
        return res.status(404).json({ status: 'error', message: 'Coupon not found' });
      }
      res.status(200).json({ status: 'success', message: 'Coupon deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  const couponApply = async (req, res) => {
    try {
      const couponCode = req.params.couponCode;
      const couponExist = await Coupon.findOne({ couponCode: couponCode });
      const user = req.session.user_id;
      const total = req.query.grandtotal;
      let discountAmount = 0; // Declare discountAmount as a variable
      const usercoupon = await User.find({_id:user, coupon:couponCode})

      if(usercoupon.length > 0)
      {
        return res.send({ status: false, message: "coupon already used" });
      }



      if (couponExist) {
        

        if (new Date(couponExist.validity) - new Date() > 0) {
          if (total >= couponExist.minPurchase) {
            discountAmount = (total * couponExist.minDiscountPercentage) / 100;
  
            if (discountAmount > couponExist.maxDiscountValue) {
              discountAmount = couponExist.maxDiscountValue;
            }
  
            // Update the user's coupons
            await User.updateOne({ _id: user }, { $push: { coupon: couponCode } });
  
            return  res.send({
              status: true,
              discountAmount: discountAmount,
              discount: couponExist.minDiscountPercentage,
              couponCode: couponCode,
              total: total,
              message: "Coupon applied successfully",
            });
          } else {
            return res.send({
              status: false,
              message: `Minimum purchase amount is ${couponExist.minPurchase}`,
            });
          }
        } else {
          return res.send({ status: false, message: "Coupon has expired" });
        }
      } else {
        return res.send({ status: false, message: "Coupon doesn't exist" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  
module.exports={
    addCoupon,
    couponPost,
    couponManagement,
    generateCoupon,
    deleteCoupon,
    couponApply
}