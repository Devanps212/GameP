const Banner = require('../models/BannerModel')
const multer = require('multer')
const path = require('path')
const Products = require('../models/productmodel')

const storage = multer.diskStorage({
    destination:(req, file, cb)=>
    {
        cb(null, 'public/Pictures/images/Banner')
    },
    filename:(req, file, cb)=>
    {
        const uniqueSuffix = Date.now()
        const ext = path.extname(file.originalname)
        const filename = uniqueSuffix + ext
        cb(null, filename)
    }
})
const upload = multer({
    storage,
    limits:{fileSize : 1024 * 1024 * 10}
})


const BannerManagement = async(req, res)=>
{
    try
    {
    const adminProfile = req.adminProfile;
    const banners = await Banner.find({})
    res.render('addBanner', {banners, adminProfile})
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const addbanner = async (req, res) => {
    try {
        upload.single('image')(req, res, async (err) => {
            if (err) {
                console.log(err);
                return res.status(400).json({ error: 'File upload failed' });
            }

            const { name, link } = req.body;
            const imageFileName = req.file.filename;
            const check = await Products.findOne({name:name})

            if(!check)
            {
             return res.status(500).json({ error: 'Product Not found' });
            }

            const banner = new Banner({
                title: name,
                link: link,
                productId:check._id,
                image: imageFileName,
            });

            const savedBanner = await banner.save();
            if(savedBanner)
            {
             return res.status(200).json({ message: 'Banner added successfully' });
            }
            else
            {
             return res.status(400).json({ message: 'Cannot add banner' });
            }
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
const unlist = async(req, res)=>
{
    try
    {
        const bannerId = req.params.bannerId
        console.log(bannerId)
        const update = await Banner.findByIdAndUpdate(bannerId, {$set:{listed:false}})
        if(update)
        {
        console.log("unlisted")
        return res.status(200).send()
        }
        else
        {
            console.log("can't unlist")
            res.status(500).send()
        }
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const list = async(req, res)=>
{
    try
    {
        const bannerId = req.params.bannerId
        const update = await Banner.findByIdAndUpdate(bannerId, {$set:{listed:true}})
        if(update)
        {
        console.log("listed")
        return res.status(200).send()
        }
        else
        {
            console.log("can't list")
            res.status(500).send()
        }
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const bannerDelete = async(req, res)=>
{
    try
    {
        const bannerId = req.params.bannerId
        const del = await Banner.findByIdAndDelete(bannerId)
        if(del)
        {
            console.log("deleted")
            return res.status(200).send()
        }
        else
        {
            console.log("Deleted")
            return res.status(400).send()
        }
    }
    catch(error)
    {
       console.log(error.message)
       return res.status(500)
    }
}

module.exports = {
    BannerManagement,
    bannerDelete,
    addbanner,
    unlist,
    list
}