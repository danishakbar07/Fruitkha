var express = require('express');
const otp = require('../config/otp');

const userHelper = require('../helpers/user-helper');
var router = express.Router();
var client = require('twilio')(otp.accountSID, otp.authToken)
    const verifyLogin= (req,res,next)=>{
      if(req.session.login){
        res.redirect('/')
        
      }else{
            next();
      }

    }
   



/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.login){
    res.redirect('/')
  }else{
    res.render('user/signup',{check:req.session.check})
    req.session.check=false
  }
  
});
router.get('/login',verifyLogin,(req,res)=>{
 
    res.render('user/login',{show:req.session.show,block:req.session.block})
    req.session.show=false
    req.session.block=false

  
 
})
router.post('/',(req,res)=>{
  req.session.userr = req.body
  //console.log(req.body);
  if(req.body.email&&req.body.password){userHelper.checkUser(req.body).then((result)=>{
    if(result.status){
      req.session.check=true
     
      res.redirect("/users" )
    }else{
      var Number = req.body.number

      req.session.phone=Number
      client.verify
      .services(otp.serviseSID)
      .verifications
      .create({
        to:`+91${Number}`,
        channel:'sms'
      })
      .then((data)=>{
      
       
      
       let user=req.session.userr
        
        res.render('user/otp', { user })
      })

   
    }
    })
    
  }
    
  
  
  

})
router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response) => {
    
      if (response.status) {
        if(response.user.status){
          req.session.user=response.user
          req.session.login=true
        
          
    
          res.redirect("/");

        }else{
          req.session.block=true
          res.redirect('/users/login')
        }
      
        
        
      
      } else {
        req.session.show=true
          res.redirect('/users/login')
      }

    

  

})
})
router.get('/otp',verifyLogin,(req,res)=>{
  res.render('user/otp')
})
router.post('/otp-varify',(req,res)=>{
   var Number = req.session.phone
  console.log( "itho"+Number);
  var otps = req.body.number
  
  

  client.verify
    .services(otp.serviseSID)
    .verificationChecks.create({
      to: `+91${Number}`,
      code: otps
    })
    .then((data) => {
      console.log(data.status + "otp status/*/*/*/");
      if(data.status=='approved'){
        userHelper.doSignup(req.session.userr).then((response)=>{

          res.redirect('/users/login')
         
        })
       
    
      }else{
        
        otpErr = 'Invalid OTP'
        res.render('user/otp',{otpErr,Number})
      }
   
});

})
router.get('/add-to-cart/:id',(req,res)=>{
  if(req.session.login){
    
    userHelper.addtoCart(req.params.id,req.session.user._id).then(()=>{
      res.json({status:true})
      
    })
  }else{
    res.redirect('/users/login')
  }
 
})

module.exports = router;


