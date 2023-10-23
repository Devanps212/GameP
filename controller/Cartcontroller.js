const User = require('../models/UserModel')
const Products = require('../models/productmodel')
const cartHelper = require('../Helper/CartHelper')
const Cart = require('../models/cartModel')
const mongoose = require('mongoose')
const Coupon = require('../models/CouponModel')


const showCart = async(req, res)=>
{
    try
    {
       const user = req.session.user_id
       console.log("userId :", user)
       

       const count = await cartHelper.cartItemCount(user)

       let cartTotal = 0
       const total = await Cart.findOne({user:user})
    //    console.log("total:", total)
       if(total)
       {
        cartTotal = total.cartTotal
        const cart = await Cart.aggregate([
            {$match :{user:new mongoose.Types.ObjectId(user)}},
            {$unwind:"$cartItems"},
            {$project:{item:{$toObjectId:("$cartItems.productId")}, quantity: "$cartItems.quantity", total:"$cartItems.total", image:"$cartItems.image"}},
            {$lookup:{from:"products", localField:"item", foreignField:"_id", as:"carted"}},
            {$project:{image:1, item:1, quantity:1, total:1, carted: {$arrayElemAt:["$carted", 0]}}}
        ])
        // cart.forEach((carted)=>
        // {
        //     console.log(carted)
        // })
        // console.log("cart:",cart);


        const discount = cartTotal * 0.10; // 10% discount
        const couponDiscount = 10; // $10 coupon discount
        const tax = cartTotal * 0.02; // 2% tax
        const shippingCost = 0; // Shipping is free
        const grandTotal = (cartTotal - discount - couponDiscount + tax + shippingCost).toFixed(2);
        console.log(cart.map(item => item.quantity));
        res.render("cart", {cart, user: user, count, cartTotal, tax, shippingCost, grandTotal, discount, cartNumber: res.locals.cartNumber})
       }
       else
       {
        res.render('cart',{user, count, cartTotal, cart: [], cartNumber: res.locals.cartNumber})
       }
       
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const addToCart = async (req, res) => {
  try {
    const response = await cartHelper.addcart(req.params.id, req.session.user_id);
    res.send(response);
  } catch (error) {
    console.log(error.message);
  }
};

const RemovePCart = async(req, res)=>
{
    try
    {
       const id = req.params.id
       const userData = await Cart.findOne({user:req.session.user_id})

       if(userData)
       {
        userData.cartItems = userData.cartItems.filter(
            (item) => item.productId.toString() !== id
        );
        userData.cartTotal = userData.cartItems.reduce(
            (total, item) => total + item.total,
            0
        );

        await userData.save()
        res.redirect('/cart');
       }
       else
       {
        console.log("User's cart not found");
        res.redirect('/cart');
       }
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const editquantity = async (req, res) => 
{
    console.log(req.body)
    const data = req.body
    cartHelper.changequantity({data})
   .then((response)=>
   {
    console.log(response)
   })
   .catch((err)=>
   {
    console.error(err)
   })
}
    
const checkout = async (req, res) => {
        const userId = req.session.user_id;
      
        try {
          const user = await User.findById(userId).populate('address');
          const cart = await Cart.findOne({ user: userId });
          const cartTotal = cart.cartTotal;
          const coupon = await Coupon.find()
          if(cartTotal)
          {
          const cartItems = await Cart.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$cartItems' },
            {
              $project: {
                items: { $toObjectId: '$cartItems.productId' },
                quantity: '$cartItems.quantity',
                total: '$cartItems.total',
                image: '$cartItems.image',
              },
            },
            {
              $lookup: {
                from: 'products',
                localField: 'items',
                foreignField: '_id',
                as: 'Products',
              },
            },
            {
              $project: {
                items: 1,
                quantity: 1,
                total: 1,
                image: 1,
                Products: { $arrayElemAt: ['$Products', 0] },
              },
            },
          ]);
      
          const discount = (cartTotal * 0.10).toFixed(2); // 10% discount
          const couponDiscount = 10; // $10 coupon discount
          const tax = cartTotal * 0.02; // 2% tax
          const shippingCost = 0; // Shipping is free
          const grandTotal = (cartTotal - discount - couponDiscount + tax + shippingCost).toFixed(2);
          const savedPrice = (cartTotal - grandTotal).toFixed(2)
      
          return res.render('Checkout', {
            user,
            cartTotal,
            cartItems,
            discount,
            couponDiscount,
            tax,
            shippingCost,
            grandTotal,
            savedPrice,
            coupon,
            cartNumber: res.locals.cartNumber
          });
        }
        } catch (error) {
          console.error(error);
          return res.status(500).send('An error occurred');
        }
      };
const selectAddress = async(req, res)=>
{
    try
    {
       const userId = req.session.user_id
       const addressId = req.body.selectedAddress

       const user = await User.findById(userId)

       if(!user)
       {
         return res.status(404).json({ error: "User not found." });
       }

       if (!mongoose.Types.ObjectId.isValid(addressId)) 
       {
        return res.status(400).json({ error: "Invalid addressId." });
       }

       const matchingAddress = user.address.find((addr) => addr._id.toString() === addressId);


       if (!matchingAddress) 
       {
        return res.status(400).json({ error: "Address not found in user's addresses." });
       }
       user.selectedAddress = addressId
       await user.save()
       console.log("selected address :" + addressId)
       res.json({ message: "Address selected successfully!" });

    }
    catch(error)
    {
        console.log(error.message)
        res.status(500).json({ error: "Failed to select address." });
    }
}
      

module.exports = {
    showCart,
    addToCart,
    RemovePCart,
    editquantity,
    checkout,
    selectAddress
}