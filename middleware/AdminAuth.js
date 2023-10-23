const islogin = async(req, res, next)=>
{
    try
    {
      if(req.session.admin_id)
      {
        next()
      }
      else
      {
        return res.redirect('/admin')
      }
    }
    catch(error)
    {
        console.log(error.message)
        return res.status(500).send("Internal Server error")
    }
} 
const NotLogin = async(req, res, next)=>
{
    try
    {
        if(req.session.admin_id)
        {
            res.redirect('/admin/home')
        }
        else
        {
            next()
        }
    }
    catch(error)
    {
        console.log(error.message)
    }
}
module.exports = {
    NotLogin,
    islogin
}