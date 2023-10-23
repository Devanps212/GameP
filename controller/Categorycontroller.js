const category = require('../models/Categorymodel')
const { addCategory } = require('./Admincontroller')
const Products = require('../models/productmodel')
const { unlisted } = require('./productcontroller')
const product = require('../models/productmodel')
const Cart = require('../models/cartModel')

const createcategory = async (req, res) => {
    try {
      const  name  = req.query.name;

      console.log(name)
      if(name.trim() == '')
      {
        return res.status(404).json({status:false, message:"category is empty"})
      }

      console.log("reached category")
  
      const existing = await category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
      const categoriesData = await category.find({});
  
      if (existing) {
        return res.status(400).json({ status: false, message: "Category already exists" });
      }
  
      const newCategory = new category({
        name,
      });
  
      const savedCategory = await newCategory.save();
      if (savedCategory) {
        console.log("Category saved");
        return res.status(200).json({ status: true, message: "Category added successfully" });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: false, message: "Internal server error" });
    }
  };

const loadCategory = async(req, res)=>
{
    try
    {
        const adminProfile = req.adminProfile;
        const categoriesData = await category.find({})
        res.render('addCategory',{categoriesData, adminProfile})
    }
    catch(error)
    {
        console.log(error.message)
    }
}

const removeCategory = async(req, res)=>  //not working
{
    try
    {
        console.log("got it")
        const id = req.params.id
        console.log(id)
        const delcategory = await category.findByIdAndDelete(id)
        if(!delcategory)
        {
            return res.status(505).json({message:"category not found"}); 
        }
        res.status(200).json({ message: 'Category deleted successfully' });
       
    
} catch(error) {
    console.log(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
}
const editCategory = async(req, res)=>
{
    try
    {
       console.log("got method")
       const id = req.params.id
       
       const data = await category.findById({_id:id})

       if(data)
       {
        res.render('edit_category', {data})
       }

    }
    catch(error)
    {
        console.log(error.message)
    }
}
const updateCategory = async(req, res)=>
{
    try
    {
       const id = req.params.id
       const name = req.body.updatedname

       const updatedCategory = await category.findByIdAndUpdate(id, {$set:{name:name}})


       if(updatedCategory)
       {
          res.redirect('/admin/category') 
       }
      
    }
    catch(error)
    {
        console.log(error.message)
        res.status(500).json({ message: "Server error" });
    }
}
const show = async(req, res)=>
{
    res.render('Home')
}
const openworld = async(req, res)=>
{
    try
    {
      const cart = await Cart.findOne({ user: req.session.user_id });
       
      let cartNumber;
      if (cart) {
        console.log("Cart exists");
        cartNumber = cart.cartItems.length || 0;
        console.log(`Number of cart items: ${cartNumber}`);
      } else {
        console.log("Cart not found for the given user ID");
      }
        console.log(cartNumber)
       const Openworld = await category.findOne({name:"OpenWorlds"})
       console.log(Openworld)
       if(Openworld && Openworld.listed)
       {
       const products = await Products.find({category:"OpenWorlds"}).limit(6)
       console.log("category available")
       res.render('OpenWorld', {products, cartNumber})
       }
       else
       {
        res.render('error-message', {message:"This category is currently un Available. Please check this page after sometimes"})
       }
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const FPS = async(req, res)=>
{
    try
    {
        const cart = await Cart.findOne({ user: req.session.user_id });
        
        let cartNumber;
        if (cart) {
          console.log("Cart exists");
          cartNumber = cart.cartItems.length || 0;
          console.log(`Number of cart items: ${cartNumber}`);
        } else {
          console.log("Cart not found for the given user ID");
        }
          console.log(cartNumber)
        const FPS_Categ = await category.findOne({name:'FPS'})
        if(FPS_Categ && FPS_Categ.listed)
        {
           const products = await Products.find({category:"FPS"}).limit(6)
           res.render('FPS', {products, cartNumber: res.locals.cartNumber})
        }
        else
        {
            res.render('error-message', {message:"This category is currently un Available. Please check this page after sometimes"})
        }
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const racing = async(req, res)=>
{
    try
    {
        const cart = await Cart.findOne({ user: req.session.user_id });
        
        let cartNumber;
        if (cart) {
          console.log("Cart exists");
          cartNumber = cart.cartItems.length || 0;
          console.log(`Number of cart items: ${cartNumber}`);
        } else {
          console.log("Cart not found for the given user ID");
        }
          console.log(cartNumber)
        const Racing = await category.findOne({name:'Racing'})
        if(Racing  && Racing.listed)
        {
        const products = await Products.find({category:"Racing"})
        res.render('Racing', {products, cartNumber})
        }
        else
        {
            res.render('error-message', {message:"This category is currently un Available. Please check this page after sometimes"})
        }
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const CategoryUnlisting = async(req, res)=>
{
    console.log("reached unlist")
    try
    {
      const categoryId = req.params.categoryId
      const categories = await category.findByIdAndUpdate(categoryId,{$set:{listed:false}})
      console.log("set unlist complete")
      if(!categories)
      {
        return res.status(404).json({message:"Cannot unlist the category"})
      }
      categories.save()
      console.log('unlisted')
      return res.status(200).json({message:"Category Unlisted"})
      
    }
    catch(error)
    {
        console.log(error.message)
        return res.status(500).json({message:"Internal server error"})
    }
}
const CategoryListing = async(req, res)=>
{
    console.log("reached list")
    try
    {
       const categoryId = req.params.categoryId
       console.log(categoryId)

       const categories = await category.findByIdAndUpdate(categoryId, {$set:{listed:true}})
       if(!categories)
       {
        return res.status(404).json({message:"Category not found"})
       }
       categories.save()
       console.log("listed")
       return res.status(200).json({message:"Category listed"})
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}
const productList = async (req, res) => {
    try {

      console.log("reached product list");
      const page = req.query.page || 1;
      const Items_per_page = 6;
      console.log("current-page: ", page)
      console.log("finding total product");
      const totalProduct = await Products.countDocuments({ is_listed: true }); // Corrected line
      console.log("checking search query");
      const searchQuery = req.query.search || '';
      console.log("checking total page");
      const totalPage = Math.ceil(totalProduct / Items_per_page);
      console.log("checking sort");
      const sort = req.query.sort || '';
      console.log("creating filter");
  
      const filter = { is_listed: true };
  
      if (searchQuery) {
        filter.$or = [
          { name: { $regex: new RegExp(searchQuery, 'i') } },
          { category: { $regex: new RegExp(searchQuery, 'i') } },
        ];
      }
  
      let sorting = {};
      if (sort) {
        if (sort == "price_asc") {
          sorting.price = 1;
        } else if (sort == "price_desc") {
          sorting.price = -1;
        }
      }
      console.log("rendering");
  
      const product = await Products.find(filter)
        .sort(sorting)
        .skip((page - 1) * Items_per_page)
        .limit(Items_per_page);
      res.render('Products', {
        product,
        totalPage,
        currentpage: page,
        searchQuery: req.query.search || '',
        sort: sort,
        cartNumber: res.locals.cartNumber,
      });
    } catch (error) {
    console.log(error.message)
    }
  };
  
module.exports = {
    CategoryUnlisting,
    CategoryListing,
    createcategory,
    removeCategory,
    updateCategory,
    loadCategory,
    editCategory,
    productList,
    openworld,
    racing,
    show,
    FPS
    
}