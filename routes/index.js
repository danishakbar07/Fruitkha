var express = require('express');
const adminHelper = require('../helpers/admin-helper');
const userHelper = require('../helpers/user-helper');
var router = express.Router();
const paypal = require('paypal-rest-sdk');

const { Db, ObjectId } = require('mongodb');


const Login=async (req,res,next)=>{
  if(req.session.login){
    cartCount= await userHelper.getcartCount(req.session.user._id)
    req.session.cartcount=cartCount

    next();
  }else{
    
    res.redirect('/users/login')
  }
}
const verifyLogin= (req,res,next)=>{
  if(req.session.login){
    res.redirect('/')
    
  }else{
        next();
  }

}
   

/* GET home page. */
router.get('/',async (req, res)=> {
 let cartCount=null
  if(req.session.login){

     cartCount= await userHelper.getcartCount(req.session.user._id)
     req.session.cartcount=cartCount
     userHelper.getallProductHome().then((products)=>{
      res.render('index',{user:req.session.user,products,use:true,cartCount} );
    })
    
  }else{
    userHelper.getallProductHome().then((products)=>{
      res.render('index',{user:req.session.user,products,use:true} );
    })
    

  }
  

  
 
 
  
});
router.get('/logout',(req,res)=>{
  req.session.login=false
  req.session.user=false
  res.redirect('/')
  
  
})
router.get('/single-product/:id',Login,(req,res)=>{
  adminHelper.getProduct(req.params.id).then((product)=>{
    res.render('user/single-product',{product,use:true,user:req.session.user,cartCount:req.session.cartcount})
  }).catch(()=>{
    res.redirect('/error')
  })
  
})
router.get('/shop',(req,res)=>{

  adminHelper.getallProducts().then((products)=>{
    adminHelper.getallCategory().then((category)=>{
      res.render('user/shop',{products,category,use:true,user:req.session.user,cartCount:req.session.cartcount,response: req.session.category})

    })

   
  })
  
})
router.get('/category/:id',async(req,res)=>{
  try{

 
  if(req.params.id=='all'){
   
    let products = await adminHelper.getallProducts()
    req.session.category=products
    res.json({status:true})
  }else{

 
  userHelper.getProductCategory(req.params.id).then((response)=>{
    
    
    req.session.category=response
    res.json({status:true})
  


    
  })
}
}catch(e){
  res.redirect('/error')
}
})
router.get('/cart',Login,async (req,res)=>{
  
  
  userHelper.getcartProducts(req.session.user._id).then(async(products)=>{
    
    
    
      subtotal= await userHelper.totalPrice(req.session.user._id)
      let total=subtotal
       
       offertotal= await userHelper.getCartoffersum(req.session.user._id)
       subtotals=subtotal-offertotal
       checkcart= await userHelper.checkCartcoupon(req.session.user._id)
       if(checkcart.coupon){ 

            
          

            if(offertotal){
          
              discountcoupon=Math.round(subtotals* checkcart.coupondiscount/100)
              coupondiscount=subtotals-discountcoupon
              
              
             
             }else {
                 discountcoupon=subtotals*checkcart.coupondiscount/100
                 coupondiscount=subtotals-discountcoupon 
                
             }
                
            }else{
              coupondiscount=0
              discountcoupon=0
            }
              
                    
      
       
       
      
      
      
       res.render('user/cart',{products,use:true,user:req.session.user,cartCount,subtotals,total,offertotal,coupondiscount,discountcoupon})
  
   
    
    
  
  })


})
router.post('/change-product-quantity',(req,res)=>{
  
  
  userHelper.changeproductQuantity(req.body).then(async (result)=>{
    result.subtotal= await userHelper.totalPrice(req.session.user._id)
    result.total= result.subtotal
    
    
    result.offertotal= await userHelper.getCartoffersum(req.session.user._id)
    result.fulloffertotal= result.offertotal+50
    

  
    res.json(result)
    

  })
})
router.get('/removeProduct/:id/:ids',(req,res)=>{
  
  userHelper.removeProduct(req.params.id,req.params.ids).then(()=>{
    res.redirect('/cart')
  }).catch(()=>{
    res.redirect('/error')
  })
})
router.get('/checkout',Login,async(req,res)=>{
  let wallet=await userHelper.getWalletamount(req.session.user._id)
 subtotal= await userHelper.totalPrice(req.session.user._id)

 let total=subtotal
 req.session.discounttotal=subtotal

 let offertotal=await userHelper.getCartoffersum(req.session.user._id)

 total = subtotal-offertotal
 req.session.discounttotal=total
 

 checkcart= await userHelper.checkCartcoupon(req.session.user._id)
 if(checkcart.coupon){ 




          

  if(offertotal){
    total=subtotal-offertotal
    discountcoupon=Math.round(total* checkcart.coupondiscount/100)
  
  coupondiscount=total-discountcoupon
  req.session.discounttotal=coupondiscount
    
 
   
   }else {
       discountcoupon=total*checkcart.coupondiscount/10
       coupondiscount=subtotal-discountcoupon 
       req.session.discounttotal=coupondiscount
   }
      
  }else{
    discountcoupon=0
   
  }
let amount=wallet-total
if(amount>=0){
  price=amount
}else{
  price=null
}
 userHelper.getcartProducts(req.session.user._id).then((products)=>{
  res.render('user/checkout',{use:true,user:req.session.user,cartCount,subtotal,total,offertotal,products,wallet,price,discountcoupon,coupondiscount})
  
    
    
    
  
})



    

 

})
router.post('/checkout',async (req,res)=>{
  
  let products=await userHelper.cartdetails(req.session.user._id)
  // let price=await userHelper.totalPrice(req.session.user._id)
  // let total=price
  let address= await userHelper.getUserAddress(req.session.addressId)

// if(req.session.discounttotal){
//   total=req.session.discounttotal
// }
  
  
  userHelper.placeOrder(address,req.body,products, req.session.discounttotal,req.session.user._id).then((response)=>{
    req.session.cartId=response.insertedId
    
 
  if(req.body.paymentmethod=='COD'){
    response.status='cod'
    
    
    res.json(response)

  }else if(req.body.paymentmethod=='razorpay'){

    userHelper.generateRazorpay(response.insertedId,req.session.discounttotal).then((result)=>{
      result.status='razorpay'
      
      
      
      res.json(result)
      

    })
  }else if(req.body.paymentmethod=='wallet'){
        userHelper.orderlist(response.insertedId).then((result)=>{
          amount=result.price
        userHelper.reduceWallet(req.session.user._id,amount).then(async()=>{
         let withdraw= await userHelper.withdraw(response.insertedId,amount,req.session.user._id)
          response.status='cod'
          res.json(response)

        })
        })
       
   
  }else{
    userHelper.generatePaypal( req.session.discounttotal).then((payment)=>{
      
     
      res.json(payment)

      
    })

  }
     
    

  // }).catch(()=>{
  //   res.redirect('/error')
  })
 

})
router.get('/order-success/:id',Login,async(req,res)=>{
  try{


  products=await userHelper.orderProducts(req.params.id)
 
  userHelper.orderlist(req.params.id).then((orders)=>{

    res.render('user/order-success',{use:true,user:req.session.user,cartCount,orders,products})  
  })
  }catch(e){
    res.redirect('/error')
  }
})
router.get('/order-success',Login,async(req,res)=>{
  userHelper.changePaymentstatus(req.session.cartId)
  products=await userHelper.orderProducts(req.session.cartId)
 
  userHelper.orderlist(req.session.cartId).then((orders)=>{

    res.render('user/order-success',{use:true,user:req.session.user,cartCount,orders,products})

  })
 
})
router.get('/success',async(req,res)=>{
  let details=await userHelper.orderlist(req.session.cartId)
  
  price=details.price
  
  

  
  
 

  
  
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": price
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
        
          throw error;
      } else {
        

          res.redirect('/order-success')

      }
    
  });

  router.get('/cancel',(req,res)=>{

    res.redirect('/')
  })

  
  



  
 
})

router.post('/verify-payment',(req,res)=>{
  
  
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changePaymentstatus(req.body['order[receipt]']).then(()=>{
const    response={
        orderId:req.body['order[receipt]'],
        status:true
      }
      res.json(response)
    })
    // .catch((err)=>{
    //   res.redirect('/error')
    // })
  })
})
router.get('/user-profile',Login,(req,res)=>{
  userHelper.getUser(req.session.user._id).then((users)=>{

    
    

    res.render('user-profile/user-profile',{use:true,users,wrong: req.session.wrong,user:req.session.user,cartCount})
    req.session.wrong=false

  })

  
})
 
router.get('/view-orders',Login,(req,res)=>{
  userHelper.orderlists(req.session.user._id).then((result)=>{
   
   
    
    res.render('user-profile/vieworders',{result,use:true,user:req.session.user,cartCount})
      


  })
 
})

router.get('/view-address',Login,(req,res)=>{
  userHelper.getAddress(req.session.user._id).then((response)=>{
    
    res.render('user-profile/user-address',{response,use:true,user:req.session.user,cartCount})

  })
 
})
router.get('/address-form',Login,(req,res)=>{
  

    res.render('user-profile/address-form',{use:true,user:req.session.user,cartCount})

  
  
})
router.post('/address-form',Login,(req,res)=>{
  userHelper.addAddress(req.body,req.session.user._id).then(()=>{
    
    res.redirect('/view-address')
  })
})
router.post('/change-password',(req,res)=>{
  userHelper.changePassword(req.body,req.session.user._id).then((result)=>{
   res.json(result)
    
   

  })
})
router.post('/addwallet',(req,res)=>{
  
  
  userHelper.addWallet(req.session.user._id,req.body.number).then((response)=>{
    

    res.json(response)
  })
})
router.get('/select-address',Login, async (req,res)=>{
  let address=await userHelper.getAddress(req.session.user._id)
  res.render('user/Select-Address',{address})
  
})
router.get('/select-addresses',(req,res)=>{
  userHelper.totalPrice(req.session.user._id).then(async(total)=>{
    if(total==0){
      res.json({status:true})
    }else{
     res.json({status:false})
    }

  })
})

router.post('/save-address/:id',(req,res)=>{
try{


  
  
  req.session.addressId=req.params.id
  res.redirect('/checkout')
}catch(e){
  res.redirect('/error')
}

})
router.post('/new-address',(req,res)=>{
  
  userHelper.addAddress(req.body,req.session.user._id).then((response)=>{
    req.session.addressId=response.insertedId
    res.redirect('/checkout')
  })
})
router.post('/check-coupon',(req,res)=>{

  userHelper.checkCoupon(req.body.name,req.session.user._id).then((result)=>{
  res.json(result)
   
  })
})
router.get('/error',(req,res)=>{
  res.render('error')
})
module.exports = router;
