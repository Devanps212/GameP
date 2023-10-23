const express = require('express')
const user_route = express()
const session = require('express-session')
const auth = require('../middleware/Auth')
const hbs = require('hbs')

const {textLimit, NotEqualto, unlessFirst, check, ifeq, pagination, currentpage, sessionCheck} = require('../HBS_helpers/admin')

//helper
hbs.registerHelper("Limit", textLimit)
hbs.registerHelper("unless_eq", NotEqualto)
hbs.registerHelper("unlessFirst", unlessFirst)
hbs.registerHelper('filterProduct', check)
hbs.registerHelper("if_eq", ifeq)
hbs.registerHelper("pagination", pagination)
hbs.registerHelper("currentPage", currentpage)
hbs.registerHelper('ifAuthenticated', sessionCheck)




const path = require('path')

const MDBsession = require('connect-mongodb-session')(session)
const store = new MDBsession({
    uri: "mongodb://127.0.0.1:27017/Database",
    collection:"session_IDs"
})

user_route.use(session({
    secret:"sessionid",
    store:store,
    resave:false,
    saveUninitialized:false
}))
const nocache = require('nocache')

user_route.set("view engine", "hbs")
user_route.set("views", path.join(__dirname,"../views/User"))


const bodyparser = require('body-parser')
user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({extended:true}))

//controllers
const categorycontroller = require('../controller/Categorycontroller')
const usercontroller = require('../controller/Usercontroller') 
const productcontroller = require('../controller/productcontroller')
const profilecontroller = require('../controller/ProfileController')
const cartcontroller = require('../controller/Cartcontroller')
const couponController = require('../controller/CouponController')
const reviewController = require('../controller/ReviewController')
const { Collection } = require('mongoose')

//middleware
const authentication = require('../middleware/Authentication')
const { profile } = require('console')
const cartNumberMiddleware = require('../middleware/CartNumber')



user_route.use(nocache())

user_route.use(express.static('public'))

user_route.use(auth.sessionCheck)

// User signin and login
user_route.get('/',cartNumberMiddleware, usercontroller.loadhome )
// user_route.get('/',auth.NotLogin ,usercontroller.loadlogin)
user_route.get('/login',auth.NotLogin, usercontroller.loadlogin)
user_route.get('/signin', auth.NotLogin ,usercontroller.loadregister)

user_route.get('/logout',auth.isLogin, usercontroller.logout)
user_route.post('/OTP', usercontroller.verifyOTP)
user_route.post('/login', usercontroller.verifylogin)
user_route.post('/signin', usercontroller.verifySignin)

user_route.get('/forgotPassword', auth.NotLogin, usercontroller.forgotPassword)
user_route.post('/forgotSubmit', usercontroller.sendForgotOTP)
user_route.post('/FPOTP', usercontroller.otpVerification)
user_route.post('/reset', usercontroller.resetPassword)
//Category
user_route.get('/FPS', authentication.blocked, cartNumberMiddleware, categorycontroller.FPS)
user_route.get('/racing', authentication.blocked, cartNumberMiddleware, categorycontroller.racing)
user_route.get('/openworld', authentication.blocked, cartNumberMiddleware, categorycontroller.openworld)

//product
user_route.get('/block', usercontroller.blockpage)
user_route.get('/productDetail/:id', authentication.blocked, cartNumberMiddleware, productcontroller.info)
user_route.get('/products', cartNumberMiddleware, categorycontroller.productList)


//UserProfile
user_route.post('/addAddress',profilecontroller.addAddress)
user_route.get('/addAddress', cartNumberMiddleware, profilecontroller.showAddAddress)
user_route.get('/editAddress', profilecontroller.showeditProfile)
user_route.post('/update-profile', profilecontroller.editProfile)
user_route.post('/change-password', cartNumberMiddleware, profilecontroller.changePassword)
user_route.get('/ChangePassword',profilecontroller. Showchangepassword)
user_route.get('/Account',auth.isLogin, authentication.blocked, cartNumberMiddleware, profilecontroller.myAccount)
user_route.get('/addressData',profilecontroller.editAddress)
user_route.post('/editAddress', profilecontroller.edited)
user_route.get('/deleteAddress', profilecontroller.deleteAddress)


//cart
user_route.post('/add-to-cart/:id', auth.isLogin, authentication.blocked,cartcontroller.addToCart)
user_route.post('/editquantity', authentication.blocked, cartcontroller.editquantity)
user_route.get('/deleteProduct/:id', authentication.blocked, cartcontroller.RemovePCart)
user_route.get('/cart', auth.isLogin, authentication.blocked, cartNumberMiddleware, cartcontroller.showCart )

//checkout 
user_route.get('/Buynow/:id',auth.isLogin, cartNumberMiddleware, usercontroller.buyN)
user_route.post('/verifyPayment', usercontroller.verifyPayment)
user_route.post('/checkout', usercontroller.processCheckout)
user_route.post('/selectAddress', cartcontroller.selectAddress)
user_route.get('/confirmation', cartNumberMiddleware, usercontroller.confirmation)
user_route.get('/checkout', auth.isLogin, authentication.blocked, cartNumberMiddleware, cartcontroller.checkout)


//orders
user_route.get('/orderInfo', auth.isLogin, cartNumberMiddleware, usercontroller.orderInfo)
user_route.post('/cancelOrder/:orderId', usercontroller.CancelOrder)
user_route.get('/generate-invoice',usercontroller.Invoice)

//return
user_route.post('/return/:orderId', usercontroller.returnOrder)


//wishlist
user_route.get('/wishlists',authentication.blocked , auth.isLogin, cartNumberMiddleware, productcontroller.showWishlist)
user_route.post('/wishlist/:prodId', productcontroller.wishlist)
user_route.delete('/wishlist/:prodId', productcontroller.deleteWishList)

//coupon
user_route.get('/applycoupon/:couponCode', couponController.couponApply)

//e-wallet
user_route.get('/ewallet', auth.isLogin, cartNumberMiddleware, usercontroller.ewallet)

//review
user_route.post('/review/:prodId', reviewController.submitReview)

//About-Us, Contact-Us
user_route.get('/aboutus', cartNumberMiddleware, usercontroller.AboutUs)
user_route.get('/contactUs',auth.sessionCheck, usercontroller.contactUs)
user_route.post('/submitMessage', usercontroller.submitMessage)

module.exports = user_route