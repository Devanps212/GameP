const user = require('../models/UserModel')

const blocked = async(req, res, next)=>
{
  try
  {
    const block = await user.findById(req.session.user_id)
    if(!block)
    {
      return next()
    }
    if(block.is_blocked)
    {
      return res.redirect("/block")
    }
    next()
  }
  catch(error)
  {
    console.log(error.message)
  }
}
module.exports = {
    blocked
}