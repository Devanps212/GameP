const admin = require('../models/adminModel')
const User = require('../models/UserModel')
const bcrypt = require('bcrypt')
const Coupon = require('../models/CouponModel')
const Order = require('../models/OrderModel')
const Category = require('../models/Categorymodel')
const Product = require('../models/productmodel')

const Adminlogin = (req, res)=>
{
    try
    {
        res.render('Adminlogin')
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const home = async (req, res) => {
    try {

        const orders = await Order.aggregate([
            {
                $match: {
                    "status": "Delivered" 
                }
              },
              {
                $group: {
                  _id: null,
                  totalPriceSum: { $sum: { $toInt: "$total" } },
                  count: { $sum: 1 }
                }
              }
        
            ])


            const salesCount = await Order.aggregate([
               
                {
                  $match: {
                    "status": "Delivered"  
                  }
                },
                {
                  $group: {
                    _id: {
                      $dateToString: {  // Group by the date part of createdAt field
                        format: "%Y-%m-%d",
                        date: "$Date"
                      }
                    },
                    orderCount: { $sum: 1 }  // Calculate the count of orders per date
                  }
                },
                {
                  $sort: {
                    _id: 1  // Sort the results by date in ascending order
                  }
                }
              ])

              const salesData = await Order.aggregate([
                {
                  $match: {
                    "status": "Delivered"  // Consider only completed orders
                  }
                },
                {
                  $group: {
                    _id: {
                      $dateToString: {  // Group by the date part of createdAt field
                        format: "%Y-%m-%d",
                        date: "$Date"
                      }
                    },
                    dailySales: { $sum: { $toInt: "$total" } }  // Calculate the daily sales
                  } 
                }, 
                {
                  $sort: {
                    _id: 1  // Sort the results by date in ascending order
                  }
                }
              ])
              const productsCount  = await Product.find({}).count()
              const numberOfUsers = await getUsersCount()
              const categoryCount  = await Category.find({}).count()
              const TotalRevenue = orders[0].totalPriceSum
              const totalSales = orders[0].count
              const adminProfile = req.adminProfile;

              console.log("Revenue : ", TotalRevenue)
              console.log(orders,productsCount,categoryCount,salesData,salesCount,numberOfUsers, totalSales);
              res.render('Home',{orders,productsCount,categoryCount,salesData,salesCount,numberOfUsers, TotalRevenue, totalSales, adminProfile})
      
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
const verifyadmin = async(req, res)=>
{
    try
    {
        const mail = req.body.email
        const password = req.body.password 
        const admindata = await admin.findOne({email: mail})
        if(admindata)
        {
                const hpassword = await bcrypt.compare(password, admindata.password)
                if(hpassword)
                {
                    req.session.admin_id = admindata._id
                    res.redirect('/admin/home')
                }
                else
                {
                    res.render('Adminlogin', {Message:"Password is wrong"})
                }
        }
        else
        {
            res.render('Adminlogin',{Message:"Your email is not correct"})
        }

    }
    catch(error)
    {
        console.log(error.message)
    }
}

const userview = async(req, res)=>
{
    try
    {
        console.log("reached");
        const adminProfile = req.adminProfile;
        const userdata = await User.find({})
        res.render('User_list', {user:userdata, adminProfile})
        
    }
    catch(error)
    {
        console.log(error.message)
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
        }
        const adminProfile = req.adminProfile;
        const userData = await User.find({$or:[{name:{$regex:'.*' + search + '.*',$options:'i'}}]}).sort({_id:-1})
        res.render('User_list',{user:userData, adminProfile})
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const block = async(req, res)=>
{
    try
    {
       const id = req.query.id
       await User.findByIdAndUpdate(id,{$set:{is_blocked:true}})
       res.redirect('/admin/userview')
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const unblock = async(req, res)=>
{
    try
    {
       const id = req.query.id
       await User.findByIdAndUpdate(id,{$set:{is_blocked:false}})
       res.redirect('/admin//userview')
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const logout = async(req, res)=>
{
    try
    {
        req.session.admin_id = null
        res.redirect('/admin')
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const deleteUser = async(req, res)=>
{
    try
    {
       const id = req.query.id
       await User.findByIdAndDelete(id)
       res.redirect('/admin/userview')
    }
    catch(error)
    {
        console.log(error.message)
    }
}

const getUsersCount = async () => {
    try {
      const response = await User.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ]);
  
      if (response && response.length > 0) {
        return response[0].count;
      } else {
        return 0; // No users found
      }
    } catch (error) {
      throw error;
    }
  };

const dashboard = async(req, res)=>
{
    try{
        
        const orders = await Order.aggregate([
            {
                $match: {
                    "status": "Delivered" 
                }
              },
              {
                $group: {
                  _id: null,
                  totalPriceSum: { $sum: { $toInt: "$total" } },
                  count: { $sum: 1 }
                }
              }
        
            ])


            const salesCount = await Order.aggregate([
               
                {
                  $match: {
                    "status": "Delivered"  
                  }
                },
                {
                  $group: {
                    _id: {
                      $dateToString: {  // Group by the date part of createdAt field
                        format: "%Y-%m-%d",
                        date: "$Date"
                      }
                    },
                    orderCount: { $sum: 1 }  // Calculate the count of orders per date
                  }
                },
                {
                  $sort: {
                    _id: 1  // Sort the results by date in ascending order
                  }
                }
              ])

              const salesData = await Order.aggregate([
                {
                  $match: {
                    "status": "Delivered"  // Consider only completed orders
                  }
                },
                {
                  $group: {
                    _id: {
                      $dateToString: {  // Group by the date part of createdAt field
                        format: "%Y-%m-%d",
                        date: "$Date"
                      }
                    },
                    dailySales: { $sum: { $toInt: "$total" } }  // Calculate the daily sales
                  } 
                }, 
                {
                  $sort: {
                    _id: 1  // Sort the results by date in ascending order
                  }
                }
              ])
              const productsCount  = await Product.find({}).count()
              const numberOfUsers = await getUsersCount()
              const categoryCount  = await Category.find({}).count()


              console.log(orders,productsCount,categoryCount,salesData,salesCount,numberOfUsers);
              res.render('Home',{orders,productsCount,salesData,salesCount,numberOfUsers})
    }        
    catch(error)
    {
        console.log(error.message)
    }
}
const referral = async(req, res)=>
{
    const user = await User.find({})
    const adminProfile = req.adminProfile;
    res.render('Referral Management', {user, adminProfile})
}
const changeReferral = async(req, res)=>
{
    try
    {
       const userId = req.params.userId
       const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
       const maxLength = 10;
       let referralCode = '';

       for(let i = 0; i < maxLength; i++)
       {
        const randomIndex = Math.floor(Math.random() * characters.length)
        referralCode += characters.charAt(randomIndex)
       }
       console.log(referralCode)

       const user = await User.findByIdAndUpdate(userId,{$set:{Referral_Code:referralCode}})
       if(user)
       {
        console.log("saved")
        return res.status(200).json({ message:"successfull"})
       }
       else
       {
        console.log("not saved")
        return res.status(404).json({status:false, message:"not successfull"})
       }
       
    }
    catch(error)
    {
       console.log("Internal server error")
       return res.status(500).json({status:false, message:"server error"})
    }
}
const deleteReferral = async(req, res)=>
{
    try
    {
       const userId = req.params.userId

       const user = await User.findByIdAndUpdate(userId, {$set:{Referral_Code:''}})
       if(user)
       {
        console.log("saved")
        return res.status(200).json({ message:"successfull"})
       }
       else
       {
        console.log("not saved")
        return res.status(404).json({status:false, message:"not successfull"})
       }
    }
    catch(error)
    {
      console.log(error)
      return res.status(500).json({status:false, message:"server error"})
    }
}
module.exports = {
    changeReferral,
    deleteReferral,
    verifyadmin,
    Adminlogin,
    deleteUser,
    dashboard,
    userview,
    referral,
    unblock,
    search,
    logout,
    block,
    home
}