const {BadRequestError, UnauthenticatedError}  = require('../errors')
const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')

//  not fuctional problem with parsing list price


const findProduct = async ( req, res, next) => {
            let newList = []
            let branch = req.user.branch
            let lists
            let price
            if(req.user.role === 'cashier') {
                 lists = req.body.saleList
            }

            else if (req.user.role === 'warehouse-manager'){
              lists = req.body.inventoryItems
              
            }

            else{
                throw new UnauthenticatedError('You cannot perform this action')
                
            }

            let product = []

            try {
                for (let list of lists) {
                    let prod;
                    prod = await Product.findOne({
                        _id:list.productId
                    })

                  // preparing the product element
               
                
                product.push(prod, {quantity:list.quantity})
        
                //get product quantity and calculate list 
                
              price  += list.quantity * prod.price
               newList.push(product)
                      
                }
                req.body.listOfInventoryItems = newList
                next()

            } catch (error) {
                console.log(error);
                res.status(StatusCodes.BAD_REQUEST).send({msg: error.message})
            }
   
    }
 module.exports = findProduct