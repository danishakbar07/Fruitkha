const express = require('express');
// const otp = require('../config/otp');
const shortid = require('shortid');

const userHelper = require('../helpers/user-helper');
const router = express.Router();
require('dotenv').config()
const SSID=process.env.serviseSID
const ASID= process.env.accountSID
const AUID= process.env.authToken

const client = require('twilio')(ASID, AUID)
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
   req.body.referralcode = shortid.generate();
  req.session.userr = req.body
  
  if(req.body.email&&req.body.password){userHelper.checkUser(req.body).then((result)=>{
    if(result.status){
      req.session.check=true
     
      res.redirect("/users" )
    }else{
      var Number = req.body.number

      req.session.phone=Number
      client.verify
      .services(SSID)
      .verifications
      .create({
        to:`+91${Number}`,
        channel:'sms'
      }) .then((data)=>{
      
       
      
       let user=req.session.userr
        
        res.redirect('/users/otp')
      })
      // userHelper.doSignup(req.session.userr).then((response)=>{

      //   res.redirect('/users/login')
       
      // }).catch(()=>{
      //   res.redirect('/error')
      // })
   
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
        if(response.user.referral ){
          userHelper.addReferral(response.user.referral,req.session.user._id).then(()=>{
            
          })
        }
          
    
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
  
  var otps = req.body.number
  
  

  client.verify
    .services(SSID)
    .verificationChecks.create({
      to: `+91${Number}`,
      code: otps
    })
    .then((data) => {
      
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
    res.json({
      status:false
    })
  }
 
})

module.exports = router;


