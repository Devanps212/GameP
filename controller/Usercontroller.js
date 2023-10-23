const { Redirect } = require("twilio/lib/twiml/VoiceResponse");
const User = require("../models/UserModel")
const bcrypt = require('bcrypt')
const moment = require('moment');
const mongoose = require('mongoose')
// const accountSid = "ACecfd48172f293c4baca98bc9afdf908b";
// const authToken = "e34f862748d38a0c2802f2b27b6dcb62";
// const verifySid = "VA83987255002a6a10ebff5a62897a7756";
// const client = require("twilio")(accountSid, authToken);
const Coupon = require('../models/CouponModel')
const Buynow = require('../models/BuyNowmodel')
var Products = require('../models/productmodel')
const Order = require("../models/OrderModel");
const Cart = require('../models/cartModel')
const crypto = require('crypto')
const notp = require('notp');
const nodemailer = require('nodemailer');
const { json } = require("body-parser");
const Razorpay = require('razorpay')
const Upg = require('../models/UpcomingGamesModel')
const PDFDocument = require('pdfkit')
const fs = require('fs');
const stream = fs.createWriteStream('invoice.pdf');
const Banner = require('../models/BannerModel')
const Contact = require('../models/ContactModel')


const {Razorpay_ID, Razorpay_Secret} = process.env

const razorpay = new Razorpay({
   key_id:Razorpay_ID,
   key_secret:Razorpay_Secret
})




const generateRandomSecret = () => {
  // Generate a random secret key (typically 16 to 32 characters)
  return crypto.randomBytes(16).toString('hex');
};






const securePassword = async(password)=>
{
    try
    {
    const passwordH = await bcrypt.hash(password, 10)
    return passwordH
    }
    catch(error)
    {
        console.log(error.message)
    }

}


const loadlogin = async(req, res)=>
{
    try
    {
        
        res.render('Login')
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const loadregister = async(req, res)=>
{
    try
    {
        res.render('signin')
    }
    catch(error)
    {
        console.log(error.message)
    }
}



const verifySignin = async (req, res) => {
  try {
    const email = req.body.email;
    const number = req.body.number;
    const name = req.body.username;
    const password = req.body.password;
    const mail = await User.findOne({ email: email });
    const ph = await User.findOne({ number: number });
    const Referral = req.body.Referral
    
    const refferals = await User.findOne({Referral_Code:Referral})
    if(!refferals)
    {
      return res.render('signin', { Message: 'Refferal code is not valid' });
    }
    if (!name || name.trim().length === 0) {
      return res.render('signin', { Message: 'Name should be valid' });
    }
    if (/\d/.test(name)) {
      return res.render('signin', { Message: 'Name should not contain numbers' });
    }
    const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailregex.test(email)) {
      return res.render('signin', { Message: 'Email is not valid' });
    }
    if (mail) {
      return res.render('signin', { Message: 'Email already exists' });
    }
    if (ph) {
      return res.render('signin', { Message: 'Mobile number already exists' });
    }
    const mob = /^\d{10}$/;
    if (!mob.test(number)) {
      return res.render('signin', { Message: 'Number should contain only 10 characters' });
    }
    const CP = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!CP.test(password)) {
      return res.render('signin', { Message: 'Password should contain 8 characters and some special characters' });
    }

    // Generate a random secret for the user
    const secret = generateRandomSecret();

    // Generate a TOTP (Time-Based OTP) for the current time
    const otp = notp.totp.gen(secret);

    // Create a nodemailer transporter (configure this with your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // e.g., 'gmail', 'smtp.gmail.com', or your SMTP server
      auth: {
        user: 'devanps212@gmail.com',
        pass: 'etezazrsdknrcscz',
      },
    });

    // Define the email message
    const mailOptions = {
      from: 'devanps212@gmail.com',
      to: email, // Use the user's email address for sending OTP
      subject: 'Your OTP',
      text: `Your OTP is: ${otp}`,
    };
    // Store user data and OTP secret in the session
    req.session.userData = {
      email: email,
      number: number,
      username: name,
      password: password,
      Refferal: Referral,
      secret: secret, // Store the OTP secret
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        // Handle the error, e.g., return an error response to the user
        return res.render('signin', { Message: 'Error sending OTP email. Please try again later.' });
      } else {
        console.log('Email sent:', info.response);
        // Email sent successfully, proceed to the OTP page
        res.render('OTP', { Message: 'OTP sent to your email. Please check your inbox.' });
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.render('signin', { Message: 'An error occurred. Please try again later.' });
  }
};

const verifyOTP = async (req, res) => {
  const { otp } = req.body;
  try {
    const Userdata = req.session.userData;

    if (!Userdata) {
      res.render('OTP', { Message: 'OTP is not correct' });
    } else {
      // Verify the OTP provided by the user
      const secret = Userdata.secret; // Retrieve the user's secret from the session
      const otpValid = notp.totp.verify(otp, secret);

      if (otpValid) {
        // OTP is valid, proceed with user authentication or any other action
        console.log('OTP is valid');
        try
        {
        if(Userdata.Refferal)
        {
          console.log("refferal code accepted")
          const check = await User.findOne({Referral_Code:Userdata.Refferal})
          if(check)
          {
            console.log("refferal code found")
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const maxLength = 10;
            let referralCode = '';
            console.log("creating reffaral")
            for(let i = 0; i < maxLength; i++)
            {
              const RandomIndex = Math.floor(Math.random() * characters.length)
              referralCode += characters.charAt(RandomIndex)
            }
              
             check.wallet += 100
             const inc = await check.save()
             if(inc)
             {
              console.log("price increased")
             }
             else
             {
              console.log("can't increase")
             }
            const spassword = await securePassword(Userdata.password);
            const user = new User({
              name: Userdata.username,
              email: Userdata.email,
              number: Userdata.number,
              password: spassword,
              Referral_Code:referralCode,
              wallet:100,
              is_admin: 0,
              is_verified: 1,
            });
            const dataSave = await user.save();
            if (dataSave) {
              res.redirect('/');
            } else {
              res.render('signin', { Message: 'Signin failed' });
            }
          }
          else
          {
            return res.render('signin', { Message: 'Referral Code is not valid' });
          }
        }
        else
        {
          console.log("proceeding without refferal code")
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const maxLength = 10;
        let referralCode = '';

        for(let i = 0; i < maxLength; i++)
        {
          const RandomIndex = Math.floor(Math.random() * characters.length)
          referralCode += characters.charAt(RandomIndex)
        }
        
        // Hash the user's password before storing it in the database
        const spassword = await securePassword(Userdata.password);
        const user = new User({
          name: Userdata.username,
          email: Userdata.email,
          number: Userdata.number,
          password: spassword,
          Referral_Code:referralCode,
          is_admin: 0,
          is_verified: 1,
        });
        const dataSave = await user.save();
        if (dataSave) {
          res.redirect('/login');
        } else {
          res.render('signin', { Message: 'Signin failed' });
        }
       }

        
        } catch (error) {
          console.error(error.message);
          res.render('signin', { Message: 'Signin failed' });
        }
      } else {
        // Handle the case where the provided OTP is invalid
        console.log('OTP is invalid');
        res.render('OTP', { Message: 'Incorrect OTP. Please try again.' });
      }
    }
  } catch (error) {
    console.error(error.message);
    res.render('OTP', { Message: 'An error occurred. Please try again.' });
  }
};

const verifylogin = async(req, res)=>
{
    try
    {
        const mail = req.body.email
        const password = req.body.password

        const userData = await User.findOne({email:mail})
        if(userData && userData.is_blocked)
        {
            return res.render('Login', {Message:"Your account has been blocked"})
        }
        
        if(userData)
        {
            console.log(userData)
            const pmatch = await bcrypt.compare(password, userData.password)

            if(pmatch)
            {
                req.session.user_id = userData._id
                req.session.user = await User.findOne({_id:req.session.user_id})
                console.log(req.session.user_id)
                req.session.successMessage = "Successfully signed in!";
                console.log("sucessfully signed in")
                res.redirect('/')
            }
            else
            {
                res.render('Login', {Message:"Password is wrong"})
            }
        }
        else
        {
            res.render('Login', {Message:"Email is wrong"})
        }
    }
    catch(error)
    {
        console.log(error.message)
    }
} 

const forgotPassword = async(req, res)=>
{
  try
  {
     res.render('ForgotPassword')
  }
  catch(error)
  {
     console.log(error.message)
  }
}

const sendForgotOTP = async(req, res)=>
{
  try
  {
    const email = req.body.email
    if(email.trim() == "")
    {
      return res.render('ForgotPassword', {Message:"Email is empty"})
    }
    const secret = generateRandomSecret()

    const otp = notp.totp.gen(secret)

    const transporter = nodemailer.createTransport({
      service:'gmail',
      auth:{
        user:'devanps212@gmail.com',
        pass:'etezazrsdknrcscz',
      },
    })

    const mailOptions = {
      from:'devanps212@gmail.com',
      to:email,
      subject:'Your OTP',
      text:`Your OTP is ${otp}`,
    }
    req.session.FPData = {
      email:email,
      secret:secret
    }

    transporter.sendMail(mailOptions,(error, info)=>
    {
      if(error)
      {
        console.error("Error sending email:", error)
        return res.render('ForgotPassword', {Message:"Error sending OTP, try again later"})
      }
      else
      {
        console.log('Email send :', info.response)
        res.render('FPOTP', {Message :"'OTP sent to your email. Please check your inbox.'"})
      }
    })
  }
  catch(error)
  {
     console.error('Error:', error.message)
     res.render('ForgotPassword', { Message: 'An error occurred. Please try again later.'});
  }
}
const otpVerification = async(req, res)=>
{
  try
  {
    const otp = req.body.otp
    const FPOTP = req.session.FPData
    if(!FPOTP)
    {
      res.render('FPOTP', {Message :"OTP is incorrect"})  
    }
    else
    {
      const secret = FPOTP.secret;
      const otpValidation = notp.totp.verify(otp, secret)

      if(otpValidation)
      {
        console.log("OTP valid")
        res.render('Resetpassword')
      }
      else
      {
        console.log("Password is wrong")
        res.render('FPOTP', {Message :"OTP is incorrect"})
      }
    }
  }
  catch(error)
  {
     console.error(error.message)
     re.render('FPOTP', {Message:"An error occured, please try again"})
  }
}

const resetPassword = async(req, res)=>
{
  try
  {
    const data = req.session.FPData
    const email = data.email
    console.log(email)
    const {old, newP} = req.body
    console.log(old, newP)
    const user = await User.findOne({email:email})
    if(!user)
    {
      console.log("user not found")
      return res.render('Resetpassword', {Message: "User not found"})
    }
    console.log(user.password)

    
    const CP = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(!CP.test(newP))
    {
      console.log("Password doesn't contain any special character or number")
      return res.render('Resetpassword', {Message: "Password Must have one specialCharacter and number"})
    }
    if(old == newP)
    {
      const bcryptPassword = await securePassword(newP)

      const UpdateP = await await User.findOneAndUpdate({email:email}, {$set:{password:bcryptPassword}})
      if(!UpdateP)
      {
        console.log("Can't change the password")
        return res.render('Resetpassword', {Message: "Something went wrong"})
      }
      else
      {
        console.log("password reset successfull")
        res.redirect('/login')
      }
    }
    else
    {
      console.log("Can't compare the password")
      return res.render('Resetpassword', {Message: "Password is wrong check password"})
    }
  }
  catch(error)
  {
     console.error(error.message)
     return res.render('Resetpassword', {Message: "Something went wrong"})
  }
}

const loadhome =  async(req, res)=>
{
    try
    {
        
        const UPG = await Upg.find({}) 
        const products = await Products.find().limit(6).sort({_id:-1}).skip(3)
        const successMessage = req.session.successMessage
        const banner = await Banner.find({})
        req.session.successMessage = null
        res.render('Home', {products,successMessage, UPG:UPG, banner, cartNumber: res.locals.cartNumber})

    }
    catch(error)
    {
        console.log(error.message)
    }
}
const logout = async (req, res) => {
    try {

        req.session.destroy()
        res.redirect('/')
    }
    catch (error) {
        console.log(error.message);

    }
}
const blockpage = async(req, res)=>
{
  try
  {
     res.render('Blocked')
  }
  catch(error)
  {
    console.log(error.message)
  }
}
const myAccount = async(req, res)=>
{
  try
  {
    const userData = await User.findById(req.session.user_id).populate('address')
    res.render('my-account',{userData})
    
  }
  catch(error)
  {
    console.log(error.message)
  }
}

const processCheckout = async (req, res) => {
  try {
      const { paymentMethod, grandTotal, savedPrice, ProductId } = req.body;
      const userId = req.session.user_id;

      const user = await User.findById(userId).populate('address');

      if (!paymentMethod) {
          return res.render('error-message', { message: "Payment Method not found" });
      }

      if (ProductId) {
          // "buynow" checkout
          console.log("Entering Buynow");
          const product = await Products.findById(ProductId);
          const address = user.selectedAddress;
          const paymentAmount = grandTotal;
          const Items = {
              productId: ProductId,
              quantity: 1,
              total: product.price,
              image: product.image[0]
          };

          if (paymentMethod === "Wallet") {
              if (user.wallet < paymentAmount) {
                  return res.render('error-message', { message: "Wallet didn't have enough cash" });
              } else {
                  user.wallet -= paymentAmount;
                  user.WalletTransaction.push({
                      type: "Debit",
                      Amount: paymentAmount,
                      Date: new Date()
                  });
                  order.paymentStatus = 'Success';
                  await user.save();
              }
          }

          const date = new Date(); // Current date and time


          const order = new Order({
              user: userId,
              address: address,
              items: Items,
              total: grandTotal,
              paymentMethod: paymentMethod,
              status: 'Pending',
          });
          console.log(order)

          await order.save();

          if(paymentMethod === "Razorpay")
          {
            const newRazorpayOrder = async(Items, order)=>
            {
              console.log("reached razorpay order in Buynow")
              const razorpayOrder = await razorpay.orders.create({
                amount: grandTotal * 100,
                currency: "INR",
                receipt: order._id.toString()
              })
              console.log("Entered razorpay")
              console.log(razorpayOrder)
              return razorpayOrder
            }
            console.log("orders : ",order)

            const RazorpayOrder = await newRazorpayOrder(Items, order)
            console.log("passing")
            return res.json({order, RazorpayOrder})
            
          }
          else if(paymentMethod == 'Cash On Delivery' || paymentMethod == 'Wallet')
          {
            return res.json({order})
          }
      } else {
          // Regular cart checkout
          const { paymentMethod, grandTotal, savedPrice } = req.body;
          
          console.log(`Selected payment method: ${paymentMethod}`)
          const userId = req.session.user_id
          const user = await User.findById(userId).populate('address')
          console.log("savedPrice :", savedPrice)
          console.log("grandtotal: ", grandTotal)
          const address = user.selectedAddress
          const cart = await Cart.findOne({user:userId})
          const CartProducts = cart.cartItems;
          let Items = [];
          for (const item of CartProducts) {
                const product = await Products.findById(item.productId);

                if (!product || product.stock < item.quantity) {
                    return res.render('error-message', { message: "Sorry, a product is out of stock or not found" });
                }

                Items.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    total: item.quantity * product.price,
                    image: product.image[0]
                });

                // Deduct the stock of purchased items
                product.stock -= item.quantity;
                await product.save();
            }
         
          if (grandTotal > 50000) 
          {
              console.log("Amount exceeds the maximum allowed amount of 5000 INR");
              return res.render('error-message', { message: "Amount exceeds the maximum allowed amount of 5000 INR." });
          }

          if(!paymentMethod)
          {
              return res.render('error-message',{message:"Payment Method not found"})
          }
          console.log("payment method approved")

          if(paymentMethod === "Wallet")
          {
            const PaymentAmount = grandTotal 
            console.log(PaymentAmount)
            console.log(user.wallet)
            if(user.wallet < PaymentAmount)
            {
              console.log("not enough cash")
              return res.render('error-message',{message:"Insufficient Balance"})
            }
            else if(user.wallet >= PaymentAmount)
            {
              console.log("Wallet have balance")
              user.wallet -= PaymentAmount
              await user.WalletTransaction.push({
                type:"Debit",
                Amount:PaymentAmount,
                Date:new Date(),
              })
              await user.save()
              console.log("user saved")

            }
            
          }
          console.log("date fixing")
          const date = new Date(); // Current date and time
          const orderDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Set the time portion to midnight

          console.log("order creating")
          const order = new Order({
              user: userId,
              address: address,
              items: Items,
              total: grandTotal,
              paymentMethod: paymentMethod,
              status: 'Pending',
              Date: orderDate
          });
          console.log(order)
          await order.save()
          const OrderId = order._id;

          if(paymentMethod === "Razorpay")
            {
              const newRazorpayOrder = async(CartProduct, order)=>
              {
                console.log("reached razorpay order")
                const razorpayOrder = await razorpay.orders.create({
                  amount: grandTotal * 100,
                  currency: "INR",
                  receipt: order._id.toString()
                })
                console.log("Entered razorpay")
                return razorpayOrder
              }

              const RazorpayOrder = await newRazorpayOrder(CartProducts, order)
              await Cart.findOneAndUpdate({ user: userId }, { cartItems: [], cartTotal: 0 });
              console.log("order passing")
              return res.json({order, RazorpayOrder})
              
            }
            else if(paymentMethod == 'Cash On Delivery' || paymentMethod == 'Wallet')
            {
              await Order.findByIdAndUpdate(OrderId, { onlinePaymentStatus: "success" });
              await Cart.findOneAndUpdate({ user: userId }, { cartItems: [], cartTotal: 0 });
              return res.json({order})
            }
              }
          } catch (error) {
              console.log(error.message);
              res.status(500).json({ error: error.message });
          }
        };
const confirmation = async(req, res)=>
{
  try
  {
  console.log("confirmation")
  const userId = req.session.user_id
  const user = await User.findById(userId)
  const addressId = user.selectedAddress
  let selectedAddID;
  console.log("selected addressID = " + addressId)
  if(addressId)
  {
    selectedAddID = user.address.find((address)=>address._id.equals(addressId))
  }
    res.render('CompleteCheckout', {selectedAddID: selectedAddID})
 }
 catch(error)
 {
  console.log(error.message)
 }
}
const verifyPayment = async (req, res) => {
  try {
      console.log("verifying")
      const data = req.body;
     
      const OrderId = data.data.receipt
      console.log(OrderId);
      const hmac = crypto.createHmac('sha256', '9qM2anj2XauBCOO10BM3MWTl');
      hmac.update(data.payment.razorpay_order_id + '|' + data.payment.razorpay_payment_id);
      const hashedHmac = hmac.digest('hex');
      console.log("going to check the hashedHmac")
      console.log("order_id :",data.payment.razorpay_order_id )
      console.log("payment_id :", data.payment.razorpay_payment_id)
      console.log("hashedHmac : ", hashedHmac)
      console.log("signature : ", data.payment.razorpay_signature)
      if (hashedHmac.trim() === data.payment.razorpay_signature.trim()) {
          console.log("Updating order")
          //  const orderss = await Order.findByIdAndUpdate({user:req.session.user_id},{onlinePaymentStatus:"success" });
          //  const order = await Order.findById(OrderId);
          //   if (order.paymentMethod === "Razorpay") {
          //       const userId = order.user;
          //       await Cart.findOneAndUpdate({ user: userId }, { cartItems: [], cartTotal: 0 });
          //   }
            console.log("success")
          return res.json({ success: true,data });
      } else {
          return res.json({ success: false, error: 'Payment verification failed' });
      }
  } catch (error) {
      console.log(error.message);
  }
} 

const buyN = async (req, res) => {
  const productId = req.params.id;
  const userId = req.session.user_id;
  console.log("reached buyN")

  try {
    const product = await Products.findById(productId);

    if (!product || product.stock < 1) {
      console.log("Product not found or out of stock");
      return res.status(404).json({ status: 404, message: "Product not found or out of stock" });
    }

    const user = await User.findById(userId).populate('address');
    const coupons = await Coupon.find()
    const total = product.price
    const discount = (total * 0.10).toFixed(2); // 10% discount
    const couponDiscount = 10; // $10 coupon discount
    const tax = (total * 0.02).toFixed(2) // 2% tax
    const shippingCost = 0; // Shipping is free
    const grandTotal = (Number(total) - Number(discount) - Number(couponDiscount) + Number(tax) + Number(shippingCost)).toFixed(2);

    res.render("BuyNowCheckout",{product, user, total, shippingCost, coupons,cartNumber: res.locals.cartNumber });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};




 
const orderInfo = async(req, res)=>
{
  try
  {
    const userId = req.session.user_id
    const user = await User.findById(userId)

    const orders = await Order.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $unwind: '$items' },
        {
          $project: {
            items: { $toObjectId: '$items.productId' },
            quantity: '$items.quantity',
            total: '$total',
            image: '$items.image',
            paymentMethod:'$paymentMethod',
            status:'$status',
            orderTotal:'$total'
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
            paymentMethod: 1,
            status: 1,
            orderTotal: 1,
            Products: { $arrayElemAt: ['$Products', 0] },
          },
        },
      ]);
      
      const total = orders.reduce((acc, order) => acc + order.orderTotal, 0);
      const discount = (total * 0.10).toFixed(2);
      const tax = (total * 0.02).toFixed(2);
      const shippingCost = 0.00;
      const grandTotal = (total - parseFloat(discount) + parseFloat(tax) + shippingCost).toFixed(2);
      
      console.log(discount, tax, shippingCost, grandTotal);

    res.render('OrderInfo', {orders, user, discount:discount, tax:tax, shippingCost:shippingCost, grandTotal:grandTotal, cartNumber: res.locals.cartNumber})
  }
  catch(error)
  {
    console.log(error.message)
  }
}
const CancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.session.user_id;

    const cancel = await Order.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(orderId),
      user: new mongoose.Types.ObjectId(userId),
    });
    

    if (!cancel) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (cancel.paymentMethod === "Razorpay" || cancel.paymentMethod === "Wallet") {
      const user = req.session.user_id;
      const currentUser = await User.findById(user);

      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const orderTotal = cancel.total;
      currentUser.wallet += orderTotal;

      currentUser.WalletTransaction.push({
        type: "Credit",
        Amount: orderTotal,
        Date: new Date(),
      });

      await currentUser.save();
    }

    return res.status(200).json({ message: 'Order deleted successfully, Order amaount Transferred to your Wallet' });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const ewallet = async(req, res)=>
{
  try
  {
    console.log("reached ewallet")
     const userId = req.session.user_id
     console.log(userId)
     const user = await User.findOne({_id:userId})
     console.log(user)
     const formattedWallet = user.wallet.toFixed(2);

     res.render('Ewallet', {user, formattedWallet, cartNumber: res.locals.cartNumber})
  }
  catch(error)
  {
     console.log(error.message)
  }
}
const returnOrder = async(req, res)=>
{
  try
  {
     const orderId = req.params.orderId
     const order = await Order.findByIdAndUpdate(orderId, {status:"Return-Req"})
     return res.status(202).json({message:"Return Request send"})
  }
  catch(error)
  {
    console.log(error.message)
    return res.status(500)
  }
}
const returnCancel = async(req, res)=>
{
  try
  {
     const orderId = req.params.orderId
     const order = await Order.findByIdAndUpdate(orderId, {status:"Delivered"})
     return res.status(200).json({message:"Request Cancelled"})
  }
  catch(error)
  {

  }
}
const Invoice = async (req, res) => {
  try {
    const orderId = req.query.id;
    const orderData = await Order.findById(orderId).populate('address');

    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    const products = orderData.items.map(item => item.productId);
    const user = await User.findById(req.session.user_id);

    if (!user) {
      console.log("User not found");
    }

    const selectedAddressId = user.selectedAddress;
    const selectedAddress = user.address.find(address => address._id.equals(selectedAddressId));

    if (!selectedAddress) {
      console.log("Selected address not found");
    }

    const Items = await Products.find({ _id: { $in: products } });
    const names = Items.map(name => name.name);

    const quantity = orderData.items.map(quant => quant.quantity);

    const invoiceData = {
      InvoiceNumber: orderId,
      InvoiceDate: new Date(orderData.Date).toDateString(),
      Products: names,
      Total: `${orderData.total.toFixed(2)} Rs`,
    };

    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    if (selectedAddress) {
      doc.fontSize(24);
      doc.text('Invoice', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveDown(1);
      doc.fontSize(14);
      doc.text('Shipping Address:');
      doc.fontSize(12);
      doc.text(`Name: ${selectedAddress.name}`);
      doc.text(`Mobile: ${selectedAddress.mobile}`);
      doc.text(`Landmark: ${selectedAddress.landmark}`);
      doc.text(`Address: ${selectedAddress.address}`);
      doc.text(`City: ${selectedAddress.city}`);
      doc.text(`State: ${selectedAddress.state}`);
      doc.text(`Pincode: ${selectedAddress.pincode}`);
      doc.text(`District: ${selectedAddress.district}`);
      doc.moveDown(1); // Extra spacing
    }

    // Add the invoice details
    doc.fontSize(22);
    doc.text('Invoice Receipt', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12);

    const tableX = 50;
    const tableY = doc.y;

    const productsList = invoiceData.Products
    .map((product, index) => `${index + 1}. ${product}`)
    .join('\n');

// ...

    const tableData = [
      { item: 'Invoice Number:', value: invoiceData.InvoiceNumber },
      { item: 'Quantity:', value: quantity },
      { item: 'Invoice Date:', value: invoiceData.InvoiceDate },
      { item: 'Items:', value: productsList },
      { item: 'Total:', value: invoiceData.Total }
    ];

    const cellPadding = 5;
    const cellWidth = 350; // Adjust the cell width as needed
    const cellHeight = 20;

    doc.fillAndStroke(null, 'black');
    

    tableData.forEach(row => {
      doc.text(row.item, tableX, doc.y, { width: cellWidth, align: 'left' });
      doc.text(row.value, tableX + cellWidth + cellPadding, doc.y, { width: cellWidth, align: 'left' });
      doc.moveDown(); // Move down by 1 line for each row
    });
    doc.moveDown(9)

    // Draw the line under the invoice
    const lineY = doc.y;
    doc.moveTo(50, lineY).lineTo(550, lineY).stroke();

    doc.moveDown(1);

    // Add the copyright notice below the line
    doc.text('Copyright © GAMPro Private Limited', { align: 'center' });

    doc.end();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const AboutUs = async(req, res)=>
{
  try
  {
     res.render('about', {cartNumber: res.locals.cartNumber})
  }
  catch(error)
  {
     console.log(error.message)
  }
}
const contactUs = async(req, res)=>
{
  try
  {
     res.render('contact-us',{cartNumber: res.locals.cartNumber})
  }
  catch(error)
  {
    console.log(error.message)
  }
}
const submitMessage = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id)
    console.log(user)
    if(user)
    {
    const { name, email, subject, message } = req.body;
    console.log(name, email, subject, message);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contact = await Contact.findOne({ name: name });

    if (contact) {
      const newMessage = {
        message: message,
        timestamp: new Date(),
      };

      contact.messages.push(newMessage);
      await contact.save();
      return res.status(200).send("success");
    } else {
      const newContact = new Contact({
        name: name,
        email: email,
        subject: subject,
        messages: [
          {
            message: message,
            timestamp: new Date(),
          },
        ],
      });

      await newContact.save();
      return res.status(200).send("success");
    }
   }
   else
   {
    console.log("user not found")
    return res.status(400).json({ message: 'User not found' });
   }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("error");
  }
};



module.exports = {
    Invoice,
    loadlogin,
    loadregister,
    verifySignin,
    verifyOTP, 
    loadhome,
    buyN,
    verifylogin,
    submitMessage,
    logout,
    blockpage,
    myAccount,
    processCheckout,
    confirmation,
    ewallet,
    orderInfo,
    CancelOrder,
    returnOrder,
    verifyPayment,
    AboutUs,
    contactUs,
    forgotPassword,
    sendForgotOTP,
    otpVerification,
    resetPassword
}