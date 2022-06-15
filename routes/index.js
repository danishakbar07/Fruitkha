var express = require('express');
const adminHelper = require('../helpers/admin-helper');
const userHelper = require('../helpers/user-helper');
var router = express.Router();
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
  if(req.session.user){

     cartCount= await userHelper.getcartCount(req.session.user._id)
     req.session.cartcount=cartCount
    
  }
    userHelper.getallProductHome().then((products)=>{
      res.render('index',{user:req.session.user,products,use:true,cartCount} );
    })

  
 
 
  
});
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
  
})
router.get('/single-product/:id',Login,(req,res)=>{
  adminHelper.getProduct(req.params.id).then((product)=>{
    res.render('user/single-product',{product,use:true,user:req.session.user,cartCount:req.session.cartcount})
  })
  
})
router.get('/shop',(req,res)=>{

  adminHelper.getallProducts().then((products)=>{
    adminHelper.getallCategory().then((category)=>{
      res.render('user/shop',{products,category,use:true,user:req.session.user,cartCount:req.session.cartcount})

    })

   
  })
  
})
router.get('/category/:id',(req,res)=>{
  userHelper.getProductCategory(req.params.id).then((response)=>{
    adminHelper.getallCategory().then((category)=>{
      res.render('user/category',{response,category})
    })
   
    
  })
})
router.get('/cart',Login,async (req,res)=>{
  
  
  userHelper.getcartProducts(req.session.user._id).then(async(products)=>{
    
    
      subtotal= await userHelper.totalPrice(req.session.user._id)
      let total=subtotal+50
    
  
   
    
    
    res.render('user/cart',{products,use:true,user:req.session.user,cartCount,subtotal,total})
  })


})
router.post('/change-product-quantity',(req,res)=>{
  
  
  userHelper.changeproductQuantity(req.body).then(async (result)=>{
    result.subtotal= await userHelper.totalPrice(req.session.user._id)
    result.total= result.subtotal
    console.log(result.total);
    
    
  
    res.json(result)
    

  })
})
router.get('/removeProduct/:id/:ids',(req,res)=>{
  
  userHelper.removeProduct(req.params.id,req.params.ids).then(()=>{
    res.redirect('/cart')
  })
})
router.get('/checkout',Login,async(req,res)=>{
 subtotal= await userHelper.totalPrice(req.session.user._id)
 let total=subtotal+50
 userHelper.getcartProducts(req.session.user._id).then((products)=>{
  res.render('user/checkout',{use:true,user:req.session.user,cartCount,subtotal,total,products})
  
    
    
    
  
})
router.post('/checkout',async (req,res)=>{
  
  let products=await userHelper.cartdetails(req.body.userid)
  let price=await userHelper.totalPrice(req.body.userid)
  let total=price+50
  userHelper.placeOrder(req.body,products,total).then((response)=>{
    
 
  if(req.body.paymentmethod=='COD'){
    response.status=true
    res.json(response)

  }else{
    userHelper.generateRazorpay(response.insertedId,total).then((result)=>{
      result.status=false
      res.json(result)
      

    })
  }
     
    

  })
 

})


    

 

})
router.get('/order-success/:id',Login,async(req,res)=>{
  products=await userHelper.orderProducts(req.params.id)
  userHelper.orderlist(req.params.id).then((orders)=>{
    res.render('user/order-success',{use:true,user:req.session.user,cartCount,orders,products})

  })
 
})
router.post('/verify-payment',(req,res)=>{
  console.log("body vannoooooooo");
  console.log(req.body);
  userHelper.verifyPayment(req.body)
})

module.exports = router;
