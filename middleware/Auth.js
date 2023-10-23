const sessionCheck = (req, res, next) => {
  res.locals.ifAuthenticated = req.session.user_id ? true : false;
  next();
};

const NotLogin = async(req, res, next)=>
{
    try
    {
      if(req.session.user_id)
      {
        res.redirect('/')
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
const isLogin = async(req, res, next)=>
{
    try
    {
      if(req.session.user_id)
      {
        next()
      }else
      {
        const alertMessage = "You are not logged in. Please log in to access this page.";
        res.send(`<script>alert("${alertMessage}"); window.location.href = "/";</script>`);
      }
    }
    catch(error)
    {
        console.log(error.message)
    }
}
module.exports = {
    NotLogin,
    isLogin,
    sessionCheck
}