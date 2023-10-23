const User = require('../models/UserModel')
const Product = require('../models/productmodel')
const Review = require('../models/ReviewModel')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb)=>
    {
       cb(null, 'public/Pictures/Review')
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



  const submitReview = async (req, res) => {
    try {
      upload.array('image')(req, res, async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error uploading images.' });
        }
  
        const productId = req.params.prodId;
        let images;
        if(req.files && req.files.length > 0)
        {
            images = req.files.map((file) => file.filename);
        }
        else
        {
            images = ["Nil"]
        }
        const { title, review } = req.body;
        const user = await User.findById(req.session.user_id)
        if(!user)
        {
          return res.status(500).json({status:'error'});
        }

        const reviewss = await Review.findOne({userId:req.session.user_id, productId:productId})
        if(reviewss)
        {
          return res.status(500).json({status:'error'});
        }
  
        console.log('Title:', title);
        console.log('Review:', review);
        console.log('Images:', images);
  
        const reviews = new Review({
          userId:req.session.user_id,
          productId:productId,
          title:title,
          review:review,
          image:images,
        })
        
        await reviews.save()
        console.log('Review submitted successfully');
        return res.status(200).json({ message: 'Review submitted successfully.' });
      });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({status:'error'});
    }
  };
module.exports = {
    submitReview
}
