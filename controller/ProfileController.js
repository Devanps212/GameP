const User = require('../models/UserModel')
const Product = require('../models/productmodel')
const bcrypt = require('bcrypt')
const multer = require('multer')
const path = require('path');
const fs = require('fs');
const { escape } = require('querystring');
const Admin = require('../models/adminModel')

const storage = multer.diskStorage({
  destination: (req, file, cb)=>
  {
     cb(null, 'public/Pictures/profile')
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


const securePassword = async(password)=>
{
  const Spassword = await bcrypt.hash(password, 10)
  return Spassword
}

const showAddAddress = async (req, res)=>
{
    try
    {
        res.render('AddAddress', {cartNumber: res.locals.cartNumber})
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const addAddress = async(req, res)=>
{
  try
  {
    const userData = req.session.user_id
    const user = await User.findOne({_id:userData})
    if (user === null) throw 'User not found'
    
    const newAddress = {
        name:req.body.name,
        mobile:req.body.mobile,
        landmark:req.body.landmark,
        city:req.body.city,
        state:req.body.state,
        pincode:req.body.pincode,
        district:req.body.district,
        address:req.body.address

    }
    user.address.push(newAddress)
    
    await user.save()
    console.log("address added")
    console.log('address added');
    const alertMessage = 'Address added successfully!';
    const previousUrl = req.headers.referer || '/'; // Use the previous URL from the Referer header, or '/' as a fallback
    const script = `
        <script>
            alert('${alertMessage}');
            window.location.href = '${previousUrl}';
        </script>
    `;

    res.send(script);
  }
  catch(error)
  {
    console.log(error.message)
  }
}
const Showchangepassword = async(req, res)=>
{
  try
  {
      res.render('ChangePassword')
  }
  catch
  {
      console.log(error.message)
  }
}
const myAccount = async(req, res)=>
{
  try
  {
    const userData = await User.findById(req.session.user_id).populate('address')
    res.render('my-account',{userData, cartNumber: res.locals.cartNumber, cartNumber: res.locals.cartNumber})
    
  }
  catch(error)
  {
    console.log(error.message)
  }
}
const changePassword = async(req, res, next)=>
{
  try
  {
      const {oldPassword, newPassword, confirmPassword } = req.body
      const id = req.session.user_id
      const user = await User.findById(id)

      const oldP = bcrypt.compare(oldPassword, user.password)

      if(!oldP)
      {
        return res.render('ChangePassword',{ Message: "Old password is incorrect. Please try again" });
      }
      const CP = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!CP.test(newPassword)) {
        return res.render('ChangePassword' , { Message: 'Password should contain 8 characters and some special characters' });
      }
      if(newPassword !== confirmPassword)
      {
        return res.render('ChangePassword' ,{Message:"NewPassword & confirmPassword is not matching. PLease try again"})
      }
      
      const bcryptPassword = await securePassword(newPassword)

      await User.updateOne({_id:id}, {$set:{password:bcryptPassword}})

      req.session.successMessage = "Password changed successfully";
      const Mess = req.session.successMessage;
      const userData = await User.findById(req.session.user_id).populate('address')
      return res.render('my-account', {Mess, userData});

  }
  catch(error)
  {
      console.log(error.message)
  }
}
const showeditProfile = async(req, res)=>
{
  try
  {
    const userId = req.session.user_id
    const profile = await User.findById(userId)
    res.render('Edit-profile', {profile})
  }
  catch(error)
  {
    console.log(error.message)
  }
}
const editProfile = async(req, res)=>
{
  try
  {
    upload.single('images')(req,res, async(err)=>
    {
       if(err)
       {
        console.log(err)
        return res.redirect('/editAddress')
       }
       if (!req.file) {
        console.log('No file uploaded');
        return res.redirect('/Account'); 
      }
      const imageName = path.basename(req.file.path);
       
       console.log(imageName)
       const id = req.session.user_id
       await User.updateOne({_id:id}, {$set:{
        name:req.body.name,
        email:req.body.email,
        number:req.body.mobile,
        profilePicture:imageName
       }})

       if(imageName == undefined)
       {
        console.log("it's undefined")
       }

       res.redirect('/Account')
    })
  }
  catch(error)
  {
    console.log(error.message)
  }
}
const editAddress = async(req, res)=>
{
  try
  {
      const addressId = req.query.addressId

      const addres = await User.findOne(
        { address: { $elemMatch: { _id: addressId } } },
        { 'address.$': 1 }
      );

      if(addres)
      {
        console.log("address found")
        console.log(addres)
        res.json(addres)
      }
      else
      {
        console.log("address not found")
        res.status(404).json({ error: 'Address not found' });
      }
  }
  catch(error)
  {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const edited = async(req, res)=>
{
  try
  {
     const addressId = req.query.addressId

     console.log(addressId)

     const {city, state, pincode, landmark, district, address} = req.body
     console.log(city, state, pincode, landmark, district, address)
     if (
      !city ||
      !state ||
      !pincode ||
      !landmark ||
      !district ||
      !address ||
      city.trim() === '' ||
      state.trim() === '' ||
      pincode.trim() === '' ||
      landmark.trim() === '' ||
      district.trim() === '' ||
      address.trim() === ''
    ) 
    {
      return res.status(400).json({ error: 'Missing or empty fields' });
    }

     const result = await User.updateOne({'address._id':addressId}, 
     {$set:{
      'address.$.city': city,
     'address.$.state': state,
     'address.$.pincode': pincode,
     'address.$.landmark': landmark,
     'address.$.district': district,
     'address.$.address': address}})

     console.log(result)

     if (result) {
      console.log(result)
      res.status(200).json({ message: 'Address updated successfully' });
  } else {
      res.status(404).json({ error: 'Address not found' });
  }
    
  }
  catch(error)
  {
    console.log(error.message)
  }
}
const deleteAddress = async(req, res)=>
{
  try
  {
    console.log("Reached delete Address")
     const addressId = req.query.addressId
    
     const deleteAddress = await User.findOneAndUpdate({ _id: req.session.user_id }, { $pull: { address:{_id: addressId }}});

     if(deleteAddress)
     {
      console.log("Deleted successfully")
      return res.status(200).json({success:true})
     }
     else
     {
      console.log("Can't delete")
      return res.status(404).json({success:false})
     }
  }
  catch(error)
  {
      console.log("error can't delete")
      return res.status(500).json({error:true})
  }
}

const AdminProfile = async(req, res)=>
{
  try
  {
    const profile = await Admin.findOne({})
    console.log(profile)
    const adminProfile = req.adminProfile;
    res.render('users-profile', {profile , adminProfile})
  }
  catch(error)
  {
    console.log(error.message)
  }
}
const editP = async (req, res) => {
  try {
    upload.single('profileImage')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'File upload error' });
      }

      const { fullName, about, company, job, country, address, phone, email } = req.body;
      const updateData = {
        name: fullName,
        description: about,
        company: company,
        job: job,
        country: country,
        address: address,
        phone: phone,
      };

      if (req.file) {
        // If a file is provided, update the profile image
        updateData.image = path.basename(req.file.path);
      }

      if (
        fullName.trim() === '' ||
        about.trim() === '' ||
        company.trim() === '' ||
        job.trim() === '' ||
        country.trim() === '' ||
        address.trim() === '' ||
        email.trim() === '' ||
        phone < 0
      ) {
        return res.status(400).json({ error: 'Invalid data provided' });
      }

      console.log('Received data:');
      console.log('Name:', fullName);
      console.log('Description:', about);
      console.log('Company:', company);
      console.log('Job:', job);
      console.log('Country:', country);
      console.log('Address:', address);
      console.log('Phone:', phone);
      console.log('Email:', email);

      const updatedAdmin = await Admin.findOneAndUpdate({ email: email }, { $set: updateData }, { new: true });

      if (!updatedAdmin) {
        console.log('No Admin document found with email:', email);
        return res.status(404).json({ error: 'Admin not found' });
      }

      res.status(200).json({ message: 'Data updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


const Pchange = async (req, res) => {
  try {
    // Destructure the current password (CP), new password (NP), and reentered password (RP) from the request body
    const { CP, NP, RP } = req.body;
    console.log('Received password change request:', CP, NP, RP);

    // Find the admin (you might want to add a filter, depending on your admin data)
    const admin = await Admin.findOne({});

    // Compare the provided current password (CP) with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(CP, admin.password);

    if (!passwordMatch) {
      console.log('Password is wrong');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (NP === RP) {
      // Hash the new password (NP) before saving it
      const hashedPassword = await securePassword(NP);

      // Update the admin's password in the database with the hashed new password
      const updatedAdmin = await Admin.updateOne({ _id: admin._id }, { password: hashedPassword });

      if (updatedAdmin) {
        console.log('Password updated successfully');
        return res.status(200).json({ message: 'Password updated successfully' });
      } else {
        console.log('Failed to update password');
        return res.status(500).json({ message: 'Failed to update password' });
      }
    } else {
      console.log('New passwords do not match');
      return res.status(400).json({ message: 'New passwords do not match' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
    addAddress,
    showAddAddress,
    deleteAddress,
    AdminProfile,
    Showchangepassword, 
    changePassword,
    showeditProfile,
    editProfile,
    myAccount,
    editAddress,
    edited,
    Pchange,
    editP
}