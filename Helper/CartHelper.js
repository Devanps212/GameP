const User = require('../models/UserModel')
const Product = require('../models/productmodel')
const Cart = require('../models/cartModel')
const { resolve } = require('path')
const wishlist = require('../models/Wishlist')

const addcart = async (productId, userId) => {
    try {
      const product = await Product.findOne({ _id: productId });
      const productObj = {
        productId: productId,
        image: product.image[0],
        quantity: 1,
        total: product.price,
      };
  
      let cart = await Cart.findOne({ user: userId });
  
      if (cart) {
        const productExist = await Cart.findOne({
          user: userId,
          "cartItems.productId": productId,
        });
  
        if (productExist) {
          await Cart.updateOne(
            { user: userId, "cartItems.productId": productId },
            {
              $inc: {
                "cartItems.$.quantity": 1,
                "cartItems.$.total": product.price,
              },
              $set: { cartTotal: cart.cartTotal + product.price },
            }
          );
          await wishlist.findOneAndUpdate({user:userId},{$pull:{product:{productId:productId}}})
          return { status: true };
        } else {
          await Cart.updateOne(
            { user: userId },
            {
              $push: { cartItems: productObj },
              $inc: { cartTotal: product.price },
            }
          );
          await wishlist.findOneAndUpdate({user:userId},{$pull:{product:{productId:productId}}})
          return { status: true };
        }
      } else {
        const newCart = new Cart({
          user: userId,
          cartItems: productObj,
          cartTotal: product.price,
        });
  
        await newCart.save();
        await wishlist.findOneIdAndUpdate({user:userId},{$pull:{product:{productId:productId}}})
        return { status: true };
      }
    } catch (error) {
      console.error(error.message);
      throw new Error('An error occurred while adding to the cart.');
    }
  };
  


const cartItemCount = (userId)=>
{
    return new Promise((resolve, reject)=>
    {
        let count = 0
        Cart.findOne({user:userId})
        .then((cart)=>
        {
            if(cart)
            {
            count = cart.cartItems.length
            }
            resolve(count)
        })
    })
}

const changequantity = ({ data }) => {
    return new Promise((resolve, reject) => {
        console.log(data)
        try {
            const prodId = data.product;
            const cartId = data.cart;
            const count = data.count;
            const quantity = data.quantity;

            console.log("ProductId: ", prodId);

            // Assuming you have a Product model
            Product.findOne({ _id: prodId })
                .then((product) => {
                    // Assuming you have a Cart model
                    Cart.findOne({ _id: cartId, "cartItems.productId": prodId })
                        .then((cart) => {
                            if (!cart || !product) {
                                resolve({ status: false, message: 'Invalid data provided' });
                            }

                            if (count == -1 && quantity == 1) {
                                Cart.updateOne(
                                    { _id: cartId },
                                    {
                                        $pull: { cartItems: { productId: prodId } },
                                        $inc: { cartTotal: -product.price * quantity }
                                    }
                                )
                                    .then(() => {
                                        resolve({ status: true });
                                    })
                                    .catch((error) => {
                                        reject(error);
                                    });
                            } else {
                                if (product.stock - quantity < 1 && count == 1) {
                                    resolve({ status: 'outOfStock' });
                                } else {
                                    // Update the quantity and total
                                    Cart.updateOne(
                                        { _id: cartId, "cartItems.productId": prodId },
                                        {
                                            $inc: {
                                                "cartItems.$.quantity": count,
                                                "cartItems.$.total": product.price * count,
                                                cartTotal: product.price * count
                                            },
                                        }
                                    )
                                        .then(() => {
                                            Cart.findOne(
                                                { _id: cartId, "cartItems.productId": prodId },
                                                { "cartItems.$": 1, cartTotal: 1 }
                                            ).then((updatedCart) => {
                                                const newQuantity = updatedCart.cartItems[0].quantity;
                                                const newSubTotal = updatedCart.cartItems[0].total;
                                                const cartTotal = updatedCart.cartTotal
                                                resolve({ status: true, newQuantity, newSubTotal, cartTotal });
                                            });
                                        })
                                        .catch((error) => {
                                            reject(error);
                                        });
                                }
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                })
                .catch((error) => {
                    reject(error);
                });
        } catch (error) {
            console.error(error.message);
            resolve({ status: false, message: 'Internal server error' });
        }
    });
};



module.exports={
    addcart,
    cartItemCount,
    changequantity

}