const multer = require('multer')
const path = require('path')
const product = require('../models/productmodel')
const category = require('../models/Categorymodel')
const { log } = require('console')
const Order = require('../models/OrderModel')
const User = require('../models/UserModel')
const Wishlist = require('../models/Wishlist')
const Upg = require('../models/UpcomingGamesModel')
const Review = require('../models/ReviewModel')
const Cart = require('../models/cartModel')



const storage = multer.diskStorage({
    destination: (req, file, cb)=>
    {
       cb(null, 'public/Pictures/Home_Buy')
    },
    filename: (req, file, cb)=>
    {
        const uniqueSuffix = Date.now()
        const ext = path.extname(file.originalname)
        const filename = uniqueSuffix + ext
        cb(null, filename)
    } 
    
})

const upload = multer({
    storage,
    limit:{fileSize : 1024 * 1024 * 5}
})

const productsView = async(req, res)=>
{
    try
    {

      const productData = await product.find({}).populate('image');
      
      const productsWithLimitedImages = productData.map((product) => {
        const limitedImages = product.image.slice(0, 3); // Limit to the first three images
        return { ...product.toObject(), image: limitedImages };
      });
      const adminProfile = req.adminProfile;
      res.render('Products', { productData: productsWithLimitedImages, adminProfile });
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const addProduct = async(req, res)=>
{
    try
    {
      const adminProfile = req.adminProfile;
      const categories = await category.find({},'_id name') 
      res.render('Add_products',{categories, adminProfile})
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const add = async (req, res) => {
  try {
    // Assuming upload.array('images', 6) is properly configured
    upload.array('images', 6)(req, res, async (err) => {
      if (err) {
        console.log(err);
        console.log("Error uploading images");
        return res.status(500).send("Error uploading images");
      }

      const categories = await category.find({});

      if (
        req.body.name.trim() === "" ||
        req.body.description.trim() === "" ||
        req.body.price <= 0 ||
        req.body.offerprice <= 0 ||
        req.body.stock <= 0
      ) {
        console.log("Can't add the product");
        return res.status(400).send("Invalid product data");
      }

      const imageName = req.files.map((file) => path.basename(file.path));
      const categorie = await category.find({ _id: req.body.category });

      const newProduct = new product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: categorie[0].name,
        stock: req.body.stock,
        offerprice: req.body.offerprice,
        image: imageName,
      });

      const prod = await newProduct.save();

      if (prod) {
        console.log("Product saved");
        return res.status(200).send("Product added successfully");
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log("Product not saved");
    return res.status(500).send("Internal Server Error");
  }
};


const ViewEditProduct = async(req, res)=>
{
    try
    {
       const id = req.params.id
       const Product = await product.findById(id)
       const categories = await category.find()

       if(!Product)
       {
        return res.status(404).send('Product not found');
       }
       const adminProfile = req.adminProfile;
       const ProductID = Product._id
       console.log('Product ID:', ProductID);
       res.render('edit-product', {Product, categories, ProductID,adminProfile})

    }
    catch(error)
    {
        console.log(error.message)
    }
}
const editSave = async(req, res)=>
{
    try
    {
       upload.array('images', 6)(req, res, async(err)=>
       {
        if(err)
        {
            console.error(err)
            res.redirect('/admin')
        }
        
        const id = req.params.id
        //Image Finding
        const existingProduct = await product.findById(id)
        const existingImage = existingProduct.image

        



        const ImageName = await req.files.map((file)=>path.basename(file.path))
        const updatedImage = ImageName.concat(existingImage)
        const categories = await category.findOne({_id:req.body.category})
         

        const editProduct = await product.findByIdAndUpdate(id,
            {name:req.body.name, 
            description:req.body.description, 
            image:updatedImage,
            category:categories.name,
            price:req.body.price,
            offerprice:req.body.offerprice,
            stock:req.body.stock,
        }, {new:true})

        if(editProduct)
        {
            console.log("succesfull")
        }
        else
        {
            console.log("not saved")
        }

        res.redirect('/admin/products')
       })
       
    }
    catch(error)
    {
        console.error(error.message)
        res.status(500).send('Internal server error')
    }
}
const search = async(req, res)=>
{
    try
    {
       let search = ''
       if(req.query.search)
       {
        search = req.query.search
        console.log(search)
       }
       const adminProfile = req.adminProfile;
       const productData = await product.find({$or:[{name:{$regex:'.*' + search + '.*',$options:'i'}}]}).sort({_id:-1})
       res.render('Products',{productData, adminProfile})
    }
    catch(error)
    {
       console.error(error)
    }
}
const deleteProduct = async (req, res) => {
    try {
      console.log("reached delete");
      const id = req.query.id.trim();
      const del = await product.deleteOne({ _id: id });
  
      if (del) {
        console.log("deleted successfully");
        return res.status(200).json({status:true, messgae:'Deletion successfull'});
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({status:false, messgae:'Internal server error'});
    }
  };
  
  
const unlisted = async(req, res)=>
{
    try
    {
      const id = req.query.id
      await product.findByIdAndUpdate(id,{$set:{is_listed:false}})
      res.redirect('/admin/products')
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const listed = async(req, res)=>
{
    try
    {
       const id = req.query.id
       await product.findByIdAndUpdate(id, {$set:{is_listed:true}})
       res.redirect('/admin/products')
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const info = async(req, res)=>
{
    
    try
    { 
       const id = req.params.id
       const products = await product.findById(id)
       const review = await Review.find({productId:id}).populate('userId')
       console.log(review)
       const user = req.session.user_id
       const order = await Order.find({"items.productId":id,user:user})
       res.render('Product_Details', {products, order, review, cartNumber: res.locals.cartNumber})
      
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const deleteImage = async(req, res)=>
{
    console.log("delete reached")
    try
    {
       const {productId,Imgindex} = req.params
       console.log("producrID :" + productId)
       console.log("Image index :" + Imgindex)

       const products = await product.findOne({_id:productId})

       if(!products)
       {
        return res.status(404).json({ message: 'Product not found' })
       }

       if(Imgindex < 0 || Imgindex >= products.image.length)
       {
        return res.status(404).json({ message: 'Image index is not valid' })
       }

       products.image.splice(Imgindex, 1)
       
       await products.save()
       res.status(200).json({ message: 'Image deleted successfully' });

    }
    catch(error)
    {
        console.log(error.message)
        res.status(500).json({ message: 'Internal server error' });
    }
}

const orderstatus = async(req, res)=>
{
    try
    {
        const Totalorders = await Order.countDocuments() 
        const adminProfile = req.adminProfile;
        const order = await Order.find().sort({_id:-1}).populate('user')
        res.render('OrderStatus',{order:order, Totalorders:Totalorders, adminProfile})
    }
    catch(error)
    {
        console.log(error)
    }
}
const orderView = async(req, res)=>
{
  try
  {
    const orderId = req.params.id

    const order = await Order.findById(orderId).populate('items.productId')
    if(!order)
    {
        return res.status(404).json({ error: 'Order not found.' });
    }
    const userId = req.session.user_id
    const user = await User.findById(userId)
    const selectedAddressId = user.selectedAddress
    let selectedAddress;
    if (selectedAddressId) {
        selectedAddress = user.address.find((address) => address._id.equals(selectedAddressId));
      }
      const adminProfile = req.adminProfile;
      res.render('OrderDetails', {order: order, selectedAddress: selectedAddress, adminProfile})


    
  }
  catch(error)
  {
    console.log(error.message)
  }
}

const UpdateStatus = async (req, res) => {
    console.log("reached update status");
    try {
      const orderId = req.params.id;
      const { newStatus } = req.body;
      console.log(newStatus);
  
      if (!['Pending', 'Processing', 'Shipped', 'Delivered', 'CANCELLED', 'Return-Req', 'Return Accepted', "Return-Declined", 'Return-Completed'].includes(newStatus)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
  
      
      const order = await Order.findOne({ _id: orderId });
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      
      order.status = newStatus;
  
      
      await order.save();
  
      
      if (newStatus === "Return-Completed" && (order.paymentMethod === 'Razorpay' || order.paymentMethod === 'Wallet')) {
        console.log(order.paymentMethod)
        const user = req.session.user_id;
        const currentUser = await User.findById(user);
  
        if (!currentUser) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        const orderTotal = order.total;
        currentUser.wallet += orderTotal;

        currentUser.WalletTransaction.push({
            type:"Credit",
            Amount:orderTotal,
            Date:new Date(),
        })
  
        await currentUser.save();
      }
  
      console.log("updated successfully");
      res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
const wishlist = async(req, res)=>
{
   
    console.log("reached Wishlist")
    
    try
    {
        const productId = req.params.prodId
        const userId = req.session.user_id
        console.log(productId)
        console.log(userId)
        

        if(!userId || !productId)
        {
            console.log("User or Product doesn't exist ")
            return res.status(404).json({message:"User or Product doesn't not exist"})

        }
        const products = await product.findById(productId)
        if(!products)
        {
            return res.status(404).json({message:"not successfull"})
        }

        const prodObj = {
        productId: productId,
        name:products.name,
        image:products.image[0],
        stock: products.stock,
        price: products.price
        }
        const wishlists = await Wishlist.findOne({user:userId})

        if(wishlists)
        {
           const exist = await Wishlist.findOne({user:userId, 'product.productId':productId})

           if(exist)
           {
            return res.status(404).json({message:"Already exist"})
           }
           else
           {
             await Wishlist.findOneAndUpdate({user:userId},{$push:{product:prodObj}})
             return res.status(200).json({message:"successfull"})
           }
        }
        else
        {
        const wishlist = new Wishlist({
            user:userId,
            product:prodObj
        })
        console.log(wishlist)

        await wishlist.save()
        console.log("saved to wishlist")
        return res.status(200).json({message:"successfull"})
        }
    }
    catch(error)
    {
        console.log(error.message)
        return res.status(505).json({message:"Internal server error"})
    }
}
const deleteWishList = async(req, res)=>
{
    try
    {
        const userId = req.session.user_id
        const productId = req.params.prodId
        if(!userId || !productId)
        {
            console.log("User or Product doesn't exist ")
            return res.status(404).json({message:"not successfull"})
        }
        await Wishlist.findOneAndUpdate({ user: userId},{$pull:{product:{productId:productId}}});
        return res.status(200).json({message:"successfull"})
    }
    catch(error)
    {
        console.log(error.message)
        return res.status(500).json({message:"Internal server error"})
    }
}
const showWishlist = async(req, res)=>
{
    try
    {
       const userId = req.session.user_id
       
       const wishlist = await Wishlist.find({user:userId})
       const allproducts = []
       console.log(wishlist);
       wishlist.forEach((products)=>
       {
          allproducts.push(...products.product)
       })

       res.render('wishlist', {wishlist:allproducts, cartNumber: res.locals.cartNumber})
       return res.status(200)

    }
    catch(error)
    {
        console.log(error.message)
    }
}

const accceptReturn = async(req, res)=>
{
    try
    {
       const orderId = req.params.orderId
       await Order.findByIdAndUpdate(orderId,{$set:{status:"Return Accepted"}})
       res.status(200).json({message:"Return Accepted"})
    }
    catch(error)
    {

    }
}
const UPG = async(req, res)=>
{
    try
    {
        console.log("Reached Upcoming games")
        const adminProfile = req.adminProfile;
        res.render('UPG', {adminProfile})
    }
    catch(error)
    {
        console.log(error.messgae)
    }
}
const SaveUPG = async (req, res) => {
    console.log("reached saveUPG");
    try {
        // Use the upload.single middleware here before handling the request
        upload.single('gameImage')(req, res, async (err) => {
            if (err) {
                console.log(err);
                return res.status(400);
            }
            console.log("checking image");
            if (!req.file) {
                console.log("image not found");
                return res.status(400);
            }
            console.log("consoling datas");
            const imagePath = req.file.path;
            const image = path.basename(imagePath)
            const Gamename = req.body.gameName;
            const validity = req.body.gameValidity;
            console.log("game :", Gamename);
            console.log("validity :", validity);
            console.log("image :", image);

            if (!Gamename || !validity) {
                console.log("game name or validity undefined");
                return res.status(400);
            }

            const UPG = new Upg({
                name: Gamename,
                image: image,
                validity: validity,
            });

            await UPG.save();
            return res.status(202).json({ status: 202, message: "Successfully added the Game" });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
}
const userOrder = async(req, res)=>
{
  try
  {
     const UserId = req.query.userId

     const orders = await Order.findOne({user:UserId}).populate('user', 'name').populate('items.productId', 'name')
     if(orders)
     {
      console.log(orders)
      console.log("orders found")
     }
     else
     {
      console.log("Order not found")
     }
     res.render('UserOrders', {orders})
  }
  catch(error)
  {

  }
}
const OrdersDate = async(req, res)=>
{
  try
  {
    const order = await Order.find({ status: "Delivered" })
    .populate('user')
    .populate({
      path: 'items.productId',
      select: 'name', // Assuming 'name' is the field that holds the product name
    });
      if(order)
      {
        const adminProfile = req.adminProfile;
        const productNames = order.map(item => item.items.map(product => product.productId.name));
        

        res.render('salesORDERdate',{order, adminProfile, productNames})
      }
      else
      {
        console.log("No orders found")
      }
  }
  catch(error)
  {
    console.log(error)
  }
}

const pdfc = async(req,res)=>
{
  try {
    const tableHtml = req.body.tableHtml;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the content to the received HTML table
    await page.setContent(tableHtml);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
    });

    // Close the browser
    await browser.close();

    // Send the PDF back to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="exported_table.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error exporting PDF');
  }
}
module.exports = {
    UPG,
    add,
    info,
    pdfc,
    search,
    listed,
    SaveUPG,
    wishlist,
    editSave,
    unlisted,
    userOrder,
    orderView,
    addProduct,
    OrdersDate,
    orderstatus,
    deleteImage,
    UpdateStatus,
    showWishlist,
    productsView,
    accceptReturn,
    deleteProduct,
    deleteWishList,
    ViewEditProduct,
}
