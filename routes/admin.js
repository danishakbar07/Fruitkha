var express = require('express');
const async = require('hbs/lib/async');
const { default: swal } = require('sweetalert');
const adminHelper = require('../helpers/admin-helper');

var router = express.Router();


/* GET home page. */
adminCred ={
  email:"admin@gmail.com",
  password:"12345"
}
router.get('/',(req,res)=>{
  if(req.session.logedIn){
    res.render('admin/home',{admin:true})
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


router.get('/product',(req,res)=>{
  adminHelper.getallProducts().then((products)=>{
    res.render('admin/product',{admin:true,products})
   
    
  })
  
 
})
router.get('/product/new-product',(req,res)=>{
  adminHelper.getallCategory().then((category)=>{
    res.render('admin/new-product',{admin:true,category},)

  })

 

})
router.get('/users',(req,res)=>{
  adminHelper.getallUsers().then((users)=>{
    res.render('admin/users/user-data',{admin:true,users})
  })


})
router.get('/users/block/:id',(req,res)=>{
  adminHelper.blockUsers(req.params.id).then((data)=>{
    res.json({status:true})
    
  })

})
router.get('/users/unblock/:id',(req,res)=>{
  
  adminHelper.unblockUsers(req.params.id).then((data)=>{
    res.json({status:true})
  })
})
router.get('/products/delete/:id',(req,res)=>{

  

  adminHelper.deleteProduct(req.params.id).then((data)=>{
   
    
    
    res.redirect('/admin/product')

  })
  
})
router.get('/category',(req,res)=>{
  adminHelper.getallCategory().then((categories)=>{
    
    res.render('admin/categories',{admin:true,categories})

  })
  
})

router.get('/new-category',(req,res)=>{
  res.render('admin/new-category',{admin:true})

})
router.post('/new-category',(req,res)=>{
  adminHelper.addcategory(req.body).then((data)=>{
    res.redirect('/admin/category')
  })
  
})
router.get('/categories/edit/:id',async(req,res)=>{
  let category= await adminHelper.getCategory(req.params.id)
  res.render('admin/edit-categories',{admin:true,category})
})
router.post('/edit-category/:id',(req,res)=>{
  adminHelper.upadateCategory(req.body,req.params.id).then((data)=>{
    res.redirect('/admin/category')
  })


})
router.get('/category/delete/:id',(req,res)=>{
  adminHelper.deleteCategory(req.params.id).then((data)=>{
    res.redirect('/admin/category')
  })

})
router.get('/products/edit/:id',async (req,res)=>{
  let product=await adminHelper.getProduct(req.params.id)
  let category=await adminHelper.getallCategory()
    res.render('admin/edit-products',{admin:true,product,category})
  
})
router.post('/product/edit-product/:id',(req,res)=>{
  
  console.log(req.body);
  
  adminHelper.upadateProduct(req.body,req.params.id).then((data)=>{
    res.redirect('/admin/product')
    if(req.files=null){
      let image=req.files.image
      image.mv('./public/product-image/'+req.params.id+'.jpg')
  
    }else{

    }
   
  })
})
router.post('/product/new-product',(req,res)=>{
 // console.log(req.body)
  //console.log(req.files.image);
  adminHelper.addProduct(req.body,(data)=>{
     let image=req.files
    image.mv('./public/product-image/'+data+'.jpg')
    res.redirect('/admin/product')

  })
    
   
    

})
module.exports = router;
