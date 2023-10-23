const Cart = require('../models/cartModel');


const fetchCartNumber = async (req, res, next) => {
  try {
    console.log("checking items in cart")
    const cart = await Cart.findOne({ user: req.session.user_id });
    if (cart) {
      res.locals.cartNumber = cart.cartItems.length || 0;
    } else {
      res.locals.cartNumber = 0;
    }
    console.log(res.locals.cartNumber);
    console.log("going to next middleware")
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = fetchCartNumber;