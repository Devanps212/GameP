const express = require('express')
const admin_route = express()
const bodyparser = require('body-parser')
const session = require('express-session')
const path = require('path')
const flash = require('connect-flash')
const hbs = require('hbs')
const {increase, compare, textLimit, stringify, unless, formatdate} = require('../HBS_helpers/admin')



//helpers
hbs.registerHelper("increase", increase)
hbs.registerHelper("if_eq", compare)
hbs.registerHelper('truncateDescription', textLimit )
hbs.registerHelper('JSONstringify',stringify)
hbs.registerHelper('unless', unless)
hbs.registerHelper('formatDate',formatdate)




//session
admin_route.use(session({
    secret:"secretkeyforsessionadmin",
    resave:false,
    saveUninitialized:false
}))
admin_route.use(flash())
const nocache = require('nocache')

admin_route.set('view engine', 'hbs')
admin_route.set('views', path.join(__dirname,"../views/Admin"))


admin_route.use(bodyparser.json())
admin_route.use(bodyparser.urlencoded({extended:true}))
  


admin_route.use(nocache())

//Controller
const admincontroller = require('../controller/Admincontroller')
const categoryController = require('../controller/Categorycontroller')
const productController = require('../controller/productcontroller')
const couponController = require('../controller/CouponController')
const bannerController = require('../controller/BannerController')
const profileController = require('../controller/ProfileController')


const adminAuth = require('../middleware/AdminAuth')
const profile = require('../middleware/AdminProfile')




admin_route.use(express.static("public"))

admin_route.get('/', adminAuth.NotLogin, admincontroller.Adminlogin)
admin_route.post('/', admincontroller.verifyadmin)
admin_route.get('/home', adminAuth.islogin, profile, admincontroller.home)
admin_route.get('/userview',adminAuth.islogin, profile, admincontroller.userview)
admin_route.get('/block' , admincontroller.block)
admin_route.get('/unblock' ,admincontroller.unblock)
admin_route.post('/searchUser', profile, admincontroller.search)
admin_route.get('/deleteUser', admincontroller.deleteUser)
admin_route.get('/logout', adminAuth.islogin , admincontroller.logout)

//Profile
admin_route.get('/profile', profile,profileController.AdminProfile)
admin_route.post('/editprof', profileController.editP)
admin_route.post('/Pchange', profileController.Pchange)


//Category
admin_route.get('/category',adminAuth.islogin, profile, categoryController.loadCategory)
admin_route.post('/addcategory', categoryController.createcategory)
admin_route.post('/deleteCategory/:id', categoryController.removeCategory)
admin_route.get('/editCategory/:id',adminAuth.islogin, categoryController.editCategory)
admin_route.post('/updateCategory/:id', categoryController.updateCategory)
admin_route.post('/unlistCat/:categoryId', categoryController.CategoryUnlisting)
admin_route.post('/listCateg/:categoryId', categoryController.CategoryListing)

//image
admin_route.post('/deleteImg/:productId/:Imgindex', productController.deleteImage)

//Products
admin_route.get('/products', adminAuth.islogin, profile, productController.productsView)
admin_route.get('/addProducts', adminAuth.islogin, profile, productController.addProduct)
admin_route.post('/addproduct', productController.add)
admin_route.get('/edit-product/:id', profile, productController.ViewEditProduct)
admin_route.post('/edit-product/:id',productController.editSave)
admin_route.post('/search', profile, productController.search)
admin_route.post('/delete', productController.deleteProduct)
admin_route.get('/list', productController.unlisted)
admin_route.get('/unlist', productController.listed)
admin_route.delete('/delete-image/:productId/:Imgindex', productController.deleteImage)
admin_route.get('/UPGames',adminAuth.islogin, profile, productController.UPG)
admin_route.post('/upload-game', productController.SaveUPG)

//orders
admin_route.get('/orders',adminAuth.islogin, profile, productController.orderstatus)
admin_route.get('/adminOrderDetails/:id', profile, productController.orderView)
admin_route.post('/updateStatus/:id', productController.UpdateStatus)
admin_route.get('/userOrder', productController.userOrder)
admin_route.get('/salesReport', productController.OrdersDate)
admin_route.post('/exportpdf', productController.pdfc)

//coupon management
admin_route.get('/couponList',adminAuth.islogin, profile, couponController.couponManagement )
admin_route.get('/addCoupons', couponController.addCoupon)
admin_route.post('/postCoupon', couponController.couponPost)
admin_route.get('/Generate', couponController.generateCoupon)
admin_route.delete('/delete', couponController.deleteCoupon)

//accept return
admin_route.post('/accepted/:orderId',productController.accceptReturn)

//Banner Managment
admin_route.get('/banner',adminAuth.islogin,profile, bannerController.BannerManagement)
admin_route.post('/addBanner', bannerController.addbanner)
admin_route.post('/unlist/:bannerId', bannerController.unlist)
admin_route.post('/list/:bannerId', bannerController.list)
admin_route.post('/deletebanner/:bannerId', bannerController.bannerDelete)

//Referral Management
admin_route.get('/Referral',adminAuth.islogin, profile, admincontroller.referral)
admin_route.post('/change/:userId', admincontroller.changeReferral)
admin_route.post('/delete/:userId', admincontroller.deleteReferral)



module.exports = admin_route