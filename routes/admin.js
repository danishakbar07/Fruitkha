const { reject } = require('bcrypt/promises');
var express = require('express');
const async = require('hbs/lib/async');
const { default: swal } = require('sweetalert');
const adminHelper = require('../helpers/admin-helper');
const { reduceWallet } = require('../helpers/user-helper');
const userHelper = require('../helpers/user-helper');

var router = express.Router();


/* GET home page. */
adminCred ={
  email:"admin@gmail.com",
  password:"12345"
}
const Login= (req,res,next)=>{
  if(req.session.logedIn){
   
    next();
  }else{
    
    res.redirect('/admin')
  }
}
router.get('/',async (req,res)=>{
  if(req.session.logedIn){
    let orderCount= await adminHelper.getTotalorderscount()
 
    let COD= await adminHelper.codAmount()
    let razorpay= await adminHelper.razorpayAmount()
    let paypal = await adminHelper.paypalAmount()
    
    
   let revenue= await adminHelper.getAllamount()
    res.render('admin/home',{admin:true,orderCount,revenue,COD,razorpay,paypal,value:true})
  }
  else{
    res.render('admin/login')
  }
  
})
// router.get('/login', function(req, res, next) {
//   if (req.session.logedIn){
//     res.redirect('/admin')
//   }else{
//     res.render('admin/login')
//   }
 
// });
router.get('/logout',(req,res)=>{
  req.session.logedIn=false
  res.redirect('/admin')
 
})
router.post('/login',(req,res)=>{
  

  if(req.body.Email==adminCred.email && req.body.password == adminCred.password){
    req.session.logedIn=true

        res.redirect('/admin')

  }else {
    res.redirect('/admin')
  }
  

})


router.get('/product',Login,async (req,res)=>{
  let offers=await adminHelper.getOffers()
  adminHelper.getallProducts().then((products)=>{
    
    
    res.render('admin/product',{admin:true,products,offers,valu:true})
   
    
  })
  
 
})
router.get('/product/new-product',Login,(req,res)=>{
  adminHelper.getallCategory().then((category)=>{
    res.render('admin/new-product',{admin:true,category},)

  })

 

})
router.get('/users',Login,(req,res)=>{
  adminHelper.getallUsers().then((users)=>{
    res.render('admin/users/user-data',{admin:true,users,values:true})
  })


})
router.get('/users/block/:id',Login,(req,res)=>{
  adminHelper.blockUsers(req.params.id).then((data)=>{
    res.json({status:true})
    
  }).catch(()=>{
    res.redirect('/error')
  })

})
router.get('/users/unblock/:id',Login,(req,res)=>{
  
  adminHelper.unblockUsers(req.params.id).then((data)=>{
    res.json({status:true})
  }).catch(()=>{
    res.redirect('/error')
  })
})
router.get('/products/delete/:id',(req,res)=>{

  

  adminHelper.deleteProduct(req.params.id).then((data)=>{
   
    
    
    res.redirect('/admin/product')

  }).catch(()=>{
    res.redirect('/error')
  })
  
})
router.get('/category',Login, async (req,res)=>{
  let coupons= await adminHelper.getCoupons()
  
  
  adminHelper.getallCategory().then((categories)=>{
    
    res.render('admin/categories',{admin:true,categories,coupons,val:true})

  })
  
})

router.get('/new-category',Login,(req,res)=>{
  res.render('admin/new-category',{admin:true,})

})
router.post('/new-category',(req,res)=>{
  adminHelper.addcategory(req.body).then((data)=>{
    res.redirect('/admin/category')
  })
  
})
router.get('/categories/edit/:id',Login,async(req,res)=>{
  try{

 
  let category= await adminHelper.getCategory(req.params.id)
 
  res.render('admin/edit-categories',{admin:true,category,coupons})
}catch(e){
res.redirect('/error')
}
})
router.post('/edit-category/:id',(req,res)=>{
  adminHelper.upadateCategory(req.body,req.params.id).then((data)=>{
    res.redirect('/admin/category')
  }).catch(()=>{
    res.redirect('/error')
  })


})
router.get('/category/delete/:id',(req,res)=>{
  adminHelper.deleteCategory(req.params.id).then((data)=>{
    res.redirect('/admin/category')
  }).catch(()=>{
    res.redirect('/error')
  })

})
router.get('/products/edit/:id',Login,async (req,res)=>{
  try{

  
  let product=await adminHelper.getProduct(req.params.id)
  let category=await adminHelper.getallCategory()
    res.render('admin/edit-products',{admin:true,product,category})
  }catch(e){
res.redirect('/error')
  }
})
router.post('/product/edit-product/:id',(req,res)=>{
  
  
  
  adminHelper.upadateProduct(req.body,req.params.id).then((data)=>{
    res.redirect('/admin/product')
    if(req.files=null){
      let image=req.files.image
      image.mv('./public/product-image/'+req.params.id+'.jpg')
  
    }
   
  }).catch(()=>{
    res.redirect('/error')
  })
})
router.post('/product/new-product',(req,res)=>{
 
  adminHelper.addProduct(req.body,(data)=>{
     let image=req.files.image
    image.mv('./public/product-image/'+data+'.jpg')
    res.redirect('/admin/product')

  })
    
   
    

})
router.get('/orders',Login,(req,res)=>{
  adminHelper.orderedlist().then((orders)=>{
    res.render('admin/users/orders',{admin:true,orders,va:true})

  })
 
})
router.get('/orderCancel/:id',Login,(req,res)=>{
  try{

  
  adminHelper.orderCancel(req.params.id).then(async(response)=>{
    console.log(response);

    let result=await userHelper.orderlist(req.params.id)
         if(result.paymentmethod!="COD"){
          let amount=result.price
            
        
            userHelper.addWallet(result.user,amount).then(()=>{
              userHelper.returnTransaction(amount,result.user,req.params.id).then(()=>{
                res.json(response)
              })
             
            })
            
       

         }
   
       res.json({status:true})
 
  
  })
}catch(e){

}
})
router.post('/editstatus',Login,(req,res)=>{
  adminHelper.changestatus(req.body).then((response)=>{
    if(response.status){
      res.json({status:true})
    
    }else{
      res.json({status:false})
    }
    
  }).catch(()=>{
    res.redirect('/error')
  })
})
router.post('/new-offer',(req,res)=>{
  adminHelper.addOffer(req.body)
  res.redirect('/admin/product')

})
router.post('/applyoffer/:id',(req,res)=>{

  adminHelper.setOffer(req.params.id,req.body)
  res.redirect('/admin/product')

})
router.get('/removeOffer/:id',(req,res)=>{
  adminHelper.removeOffer(req.params.id).then((response)=>{
    response.status=true
    res.json(response)

  })
})
router.post('/new-coupon',(req,res)=>{
  
  adminHelper.addCoupon(req.body).then((response)=>{
    res.redirect('/admin/category')
  })
})
router.get('/sales-report',Login,(req,res)=>{
  if( req.session.sales){
    sales= req.session.sales
    
  }else{
    sales=0
  }
res.render('admin/sales-report',{admin:true,sales,v:true})
})
router.post('/sales-report',(req,res)=>{
  
  let from = new Date(req.body.from)
  let to = new Date(req.body.to)
  
  adminHelper.salesDetails(from,to,req.body.type).then((result)=>{
    
    req.session.sales=result
    res.redirect('/admin/sales-report')
  })
})

module.exports = router;
