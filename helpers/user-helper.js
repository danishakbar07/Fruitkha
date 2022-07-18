var db = require("../config/connections");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { promise, reject } = require("bcrypt/promises");
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const collections = require("../config/collections");
const { resolve } = require("path");

var instance = new Razorpay({
  key_id: 'rzp_test_ha6TgI31z1G1Ys',
  key_secret: 'VvqGcPV08orTYX2bhKQ5a6FY',
});
const paypal = require('paypal-rest-sdk');
const { log } = require("console");
const { ObjectId } = require("mongodb");
 
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'Abm7h6NipGq_Lv_I5eVb03NJg6iwPDWDYAym7-Cd6I-z9p009PbPIBqs6CwI1U2SzbGfFtZNsERmJ0st',
  'client_secret': 'EBdplv_hT6MyuCPiD5I9n__cvd8nLE77P7P_JOocmne6oskSkalZpjW-KhDhc1XFiWGLu3WRvKAl6HNP'
});


module.exports = {
    doSignup: (userData) => {
       
        
          return new Promise(async (resolve, reject) => {
            console.log(userData); 
              userData.password = await bcrypt.hash(userData.password, 10)
              userData.confirm_password = await bcrypt.hash(userData.conform_password, 10)
              userData.status   = true
              db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                   
                  
                  resolve(data)
              }).catch(()=>{
                reject()
              })
  
           
          })
  
      },
      checkUser:(userData)=>{
        return new Promise(async (resolve)=>{
            let response=[]
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){ 
                response.status=true
                response.user=user
                resolve(response)
               
    
            
            }else{
                resolve(response)
            }
    
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve)=>{
    
            
           let response={
               
             
            }
            
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
      
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        
                        response.user=user;
                        
    
                        response.status = true
                        resolve(response)
                    }else{
                        resolve({status:false})
                        console.log("login failed")
    
                    }  
                })
            }else{
                console.log("Login failed");
                resolve({status:false})
            }
                
    
        })
    },
    getallProductHome:()=>{
        return new Promise (async (resolve,reject)=>{
         await   db.get().collection(collection.PRODUCTCOLLECTION).find().limit(3).toArray().then((data)=>{
                resolve(data)
            })
        })

    },
    getProductCategory:(category)=>{
        return new Promise((reslove)=>{
         db.get().collection(collection.PRODUCTCOLLECTION).find({category:category}).toArray().then((response)=>{
            console.log(response)
             reslove(response)
         }).catch(()=>{
            reject()
         })
        
        
    
 
        })
 
},
addtoCart:(proId,userId)=>{
    let proObj={
        item:objectId(proId),
        quantity:1
    }
    return new Promise(async (resolve,reject)=>{
        let userCart=await db.get().collection(collection.CARTCOLLECTION).findOne({user:objectId(userId)})
        if(userCart){
            let proExist=userCart.products.findIndex(product=>
                product.item==proId)
                console.log(proExist)
                if(proExist!=-1){
                   db.get().collection(collection.CARTCOLLECTION).updateOne({user:objectId(userId),'products.item':objectId(proId)},{
                        $inc:{
                             'products.$.quantity':1
                        }
                    })
                }else{
                        db.get().collection(collection.CARTCOLLECTION).updateOne({user:objectId(userId)},
            {
                $push:{
                    products:proObj 
                }

                
            }).then((response)=>{
                resolve(response)
            })


                }

        
        }else{
            let cart={
                user:objectId(userId),
                products:[proObj]
            }
            db.get().collection(collection.CARTCOLLECTION).insertOne(cart).then((data)=>{
                resolve(data)
            })
        }

    })
},
getcartProducts:(userId)=>{
    return new Promise(async(resolve,reject)=>{
     
        
      let items=await  db.get().collection(collection.CARTCOLLECTION).aggregate([
         
          
            {
                $match:{user:objectId(userId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCTCOLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },{

            
            $project:{
                item:1,quantity:1, product:{$arrayElemAt:['$product',0]}

            }
        },{
            $project:{
                item:1,quantity:1,product:1, total:{$sum:{$multiply:['$quantity','$product.price']}}

            }
        }
           
        ]).toArray();
        console.log('puthyathhhhhhhhhhhhhhhhhhhhhhhhhh');
        console.log(items)
        
        
            resolve(items)

        
    })
},
getcartCount:(userId)=>{
    return new Promise((resolve,reject)=>{
        let count=0
        db.get().collection(collection.CARTCOLLECTION).findOne({user:objectId(userId)}).then((data)=>{
        if(data){
            console.log(data)
            count=data.products.length
            resolve(count)
          
        }else{
            resolve(count)
        }
       

       
           


        

        })


    })
},
 changeproductQuantity:(data)=>{
    data.count=parseInt(data.count)
    return new Promise((resolve,reject)=>{
        if(data.count==-1 && data.quantity==1){
            db.get().collection(collection.CARTCOLLECTION).updateOne({_id:objectId(data.cart)},{
                $pull:{products:{item:objectId(data.product ) }}
            }).then((response)=>{
               
              
                resolve({removeProduct:true})
            })

        }else{
            db.get().collection(collection.CARTCOLLECTION).updateOne({_id:objectId(data.cart),'products.item':objectId(data.product)},{
                $inc:{
                     'products.$.quantity':data.count
                }
            }).then((response)=>{
                resolve({status:true})
            })
    

        }
      
    })
},
removeProduct:(cartId,proId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CARTCOLLECTION).updateOne({_id:objectId(cartId)},{
            $pull:{products:{item:objectId(proId) }}
        }).then((response)=>{
            resolve()
        }).catch(()=>{
            reject()
        })
        
    })
},
totalPrice:(userId)=>{
   
    return new Promise(async(resolve,reject)=>{
     
        
        let total=await  db.get().collection(collection.CARTCOLLECTION).aggregate([
           
            
              {
                  $match:{user:objectId(userId)}
              },
              {
                  $unwind:'$products'
              },
              {
                  $project:{
                      item:'$products.item',
                      quantity:'$products.quantity'
                  }
              },
              {
                  $lookup:{
                      from:collection.PRODUCTCOLLECTION,
                      localField:'item',
                      foreignField:'_id',
                      as:'product'
                  }
              },{
  
              
              $project:{
                  item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
  
              }
          },
          {
            $group:{
                _id:null,
                total:{$sum:{$multiply:['$quantity','$product.price']}}
            }
          }
             
          ]).toArray();
          console.log('totalooooooooooooooooooooooooooooooooooooooooooo');
          console.log(total)
          if(total[0]){
            resolve(total[0].total)

          }else{
            resolve(0)
          }
          
             
  
          
      })
    
},
cartdetails:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CARTCOLLECTION).findOne({user:objectId(userId)}).then((data)=>{
            resolve(data.products)
        })
    })
},
placeOrder:(details,payment,products,price,userid,offer,offercoupon,coupon,total)=>{
    let status=payment.paymentmethod==='COD'?'placed':'Pending'
    let orderObj={
        deliveryDetails:{
            
            name:details.addresses.first,
            email:details.addresses.email,
            address:details.addresses.address,

            phoneno:details.addresses.phone,
            pincode:details.addresses.pincode


        },
        

       user:objectId(userid),
       products:products,
       paymentmethod:payment.paymentmethod,
       price:price,
       status:status ,
       offer:offer,
       offercoupon:offercoupon,
       coupon:coupon,
       total:total,
       date:new Date

    }
    return new  Promise((resolve,reject)=>{
        db.get().collection(collection.ORDERCOLLECTION).insertOne(orderObj).then((response)=>{
            db.get().collection(collection.CARTCOLLECTION).deleteOne({user:objectId(userid)})
            resolve(response,price)
        })

    })
  
 
},
orderlist:(orderId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDERCOLLECTION).findOne({_id:objectId(orderId)}).then((result)=>{
            resolve(result)

        })
    })
},
orderProducts:(orderId)=>{

    console.log(orderId)
    return new Promise(async(resolve,reject)=>{
     
        
        let items=await  db.get().collection(collection.ORDERCOLLECTION).aggregate([
           
            
              {
                  $match:{_id:objectId(orderId)}
              },
              {
                  $unwind:'$products'
              },
              {
                  $project:{
                      item:'$products.item',
                      quantity:'$products.quantity'
                  }
              },
              {
                  $lookup:{
                      from:collection.PRODUCTCOLLECTION,
                      localField:'item',
                      foreignField:'_id',
                      as:'product'
                  }
              },{
  
              
              $project:{
                  item:1,quantity:1, product:{$arrayElemAt:['$product',0]}
  
              }
          },{
              $project:{
                  item:1,quantity:1,product:1, total:{$sum:{$multiply:['$quantity','$product.price']}}
  
              }
          }
             
          ]).toArray();
          console.log('orderssssssssssssssssssssssssssssssssssss');
          console.log(items)
          
          
              resolve(items)
  
          
      })
    
   
},
generateRazorpay:(orderId,total)=>{
    
    console.log(orderId);
    
    return new Promise((resolve,reject)=>{
        var options = {
            amount: total*100,  
            currency: "INR",
            receipt:""+ orderId
          };
          instance.orders.create(options, function(err, order) {
            
            console.log('');
            resolve(order)
    
          });

    })
  
},
generatePaypal:(total)=>{
    
    console.log(total);
    return new Promise((resolve,reject)=>{

  
   
        const create_payment_json = {
          "intent": "sale",
          "payer": {
              "payment_method": "paypal"
          },
          "redirect_urls": {
              "return_url": "https://danishakbargmail.com/success",
              "cancel_url": "https://danishakbargmail.com/cancel"
          },
          "transactions": [{
              "item_list": {
                  "items": [{
                      "name": "Red Sox Hat",
                      "sku": "001",
                      "price": total,
                      "currency": "USD",
                      "quantity": 1
                  }]
              },
              "amount": {
                  "currency": "USD",
                  "total": total
              },
              "description": "Hat for the best team ever"
          }]
      };
      
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
         
            console.log(payment);
            resolve(payment)
        }
      });
    })
      
      ;

},
verifyPayment:(details)=>{ 
    return new Promise((resolve,reject)=>{
        const crypto = require('crypto');
       
        const hash = crypto.createHmac('sha256', 'VvqGcPV08orTYX2bhKQ5a6FY')
               .update(details['response[razorpay_order_id]']+'|'+ details['response[razorpay_payment_id]'])
               .digest('hex');

           if(hash==details['response[razorpay_signature]']){
            resolve()
           }else{
            
            reject()
           }
    })

},
changePaymentstatus:(orderId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDERCOLLECTION).updateOne({_id:objectId(orderId)},{
            $set:{
                status:"placed"
            }
        }).then(()=>{
            resolve()
        })
    })
},
orderlists:(userId)=>{
    return new Promise (async (resolve,reject)=>{
        let orders= await db.get().collection(collections.ORDERCOLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
            },
           
     
            {
               $lookup:{
                from:collections.PRODUCTCOLLECTION,
                localField:'products.item',
                foreignField:'_id',
                as:'product'
                
               },
              
             
            },
          
            
            { $sort : { date : -1 } }
               

            
            
            
        ]).toArray()
        console.log('heyyyyyyy');
        console.log(orders);
        
        resolve(orders)
    })
},

addAddress:(address,userid)=>{
    addObj={
        user:objectId(userid),
        addresses:address
    }
    return new Promise((resolve,reject)=>{ 
        db.get().collection(collections.ADDRESSCOLLECTION).insertOne(addObj).then((response)=>{
            resolve(response)

        })
    })
},
getAddress:(userid)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ADDRESSCOLLECTION).find({user:objectId(userid)}).toArray().then((response)=>{
            resolve(response)
        })
    })
},
getUser:(userid)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userid)}).then((response)=>{
            
            resolve(response)
        })
    })
},
changePassword:(passwords,userid)=>{
    return new Promise(async (resolve,reject)=>{
        let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userid)})
        passwords.new = await bcrypt.hash(passwords.new, 10)
        bcrypt.compare(passwords.old,user.password).then((status)=>{
            if(status){
               
              
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userid)},{
                    $set:{
                        password:passwords.new
                    }
                }).then((response)=>{
                    
                    resolve({status:true})
                })
            }else{
                resolve({status:false})
            }

        })
    })


},
addWallet:(userid,amount)=>{
    console.log(userid);
    console.log('ivde ethyooooo');
     money=parseInt(amount)
    
    return new Promise(async (resolve,reject)=>{
        
       let user = await db.get().collection(collections.WALLETCOLLECTION).findOne({userid:ObjectId(userid)})
       if(user){
        db.get().collection(collections.WALLETCOLLECTION).updateOne({userid:objectId(userid)},{
            $inc:{
                amount:amount
            }

        }).then(()=>{
            resolve()
        })

       }else{
        console.log('ivdeyaanooo preshnem');
        let walletObj={
            userid:objectId(userid),
            amount:amount
        }
        db.get().collection(collections.WALLETCOLLECTION).insertOne(walletObj).then((result)=>{
            resolve()
        })
       }
   

    }) 
},
getWalletamount:(userid)=>{
    return new Promise(async (resolve,reject)=>{
        let user= await db.get().collection(collections.WALLETCOLLECTION).findOne({userid:objectId(userid)})
        if(user){
            db.get().collection(collections.WALLETCOLLECTION).findOne({userid:objectId(userid)}).then((result)=>{
                resolve(result.amount)
            })
        }else{
            resolve(0)
        }
    })
},
getWallet:(userid)=>{
    return new Promise((resolve,reject)=>{
       db.get().collection(collections.WALLETCOLLECTION).findOne({userid:objectId(userid)}).then((result)=>{
        resolve(result)
       })
    })
},
reduceWallet:(userid,amount)=>{

    let amound=parseInt(amount)
    return new Promise((resolve,reject)=>{

        db.get().collection(collections.WALLETCOLLECTION).updateOne({userid:objectId(userid)},{
            $inc:{
                amount:-amound
            }
        }).then((response)=>{
            resolve(response)
        }).catch(()=>{
            reject()
        })
    })
},
getCartoffersum:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let offertotal= await db.get().collection(collections.CARTCOLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
            },{
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collections.PRODUCTCOLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            },
            {
                $group:{
                    _id:null,
                    offertotal:{$sum:{$multiply:['$quantity','$product.offerprice']}}
                }
            },
        ]).toArray()
        if(!offertotal[0]){
            resolve(0)
        }else{
            resolve(offertotal[0].offertotal)
        }
      
    })
},
getUserAddress:(addressId)=>{
    
    console.log(addressId);
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.ADDRESSCOLLECTION).findOne({_id:objectId( addressId)}).then((address)=>{
            resolve(address)
        })
    })

},
checkCoupon:(code,userid)=>{
    return new Promise(async (resolve,reject)=>{
        let check =await db.get().collection(collections.COUPONCOLLECTION).findOne({code:code})
        
        
        if(check){
            let usercoupon= await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userid)})

            
          let user= await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userid),coupon:code})
            if(user){
                
               resolve({status:'already used'})
            }else if(usercoupon.coupon){
              
                let cart= await db.get().collection(collections.CARTCOLLECTION).findOne({user:objectId(userid)})
                if(cart.coupon){
                    resolve({status:'only one'})
                }else{
                    db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId( userid) },{
                        $push:{coupon:code}
                    })
                    db.get().collection(collections.CARTCOLLECTION).updateOne({user:objectId(userid)},{
                        $set:{
                            coupon:code,
                            coupondiscount:check.offer
                        }
                    })
                    resolve({status:'true'})
                }

               

            }
            else{
               
                db.get().collection(collections.CARTCOLLECTION).updateOne({user:objectId(userid)},{
                    $set:{
                        coupon:code,
                        coupondiscount:check.offer
                    }
                })
                db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userid)},{
                    $set:{
                        coupon:[code]
                    }
                })
                resolve({status:'true'})
            }
                
        }else{
            resolve({status:false})
        }

    })
},
checkCartcoupon:(userid)=>{
    return new Promise(async (resolve,reject)=>{
    let cart= await db.get().collection(collections.CARTCOLLECTION).findOne({user:objectId(userid)})
    if(cart){
        resolve(cart)
    }else{
        resolve(0)
    }
      
      
    })

},
couponDetail:(code)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.COUPONCOLLECTION).findOne(({code:code})).then((result)=>{
            resolve(result)
        })

    })
},
addReferral:(referral,userid,username)=>{


    return new Promise (async (resolve,reject)=>{
     let user = await db.get().collection(collections.USER_COLLECTION).findOne({referralcode:referral})
     if(user){
        
        let walletObj ={
            userid:userid,
            amount:50,
            bonus:true,
            transaction:[{
              referralMoney:50,
              username:user.name
            }]
        }
        
        db.get().collection(collections.WALLETCOLLECTION).insertOne(walletObj).then(()=>{

        })
        let userWallet=await db.get().collection(collections.WALLETCOLLECTION).findOne({userid:objectId(user._id)})
        if(userWallet){
            
            db.get().collection(collections.WALLETCOLLECTION).updateOne({userid:objectId(user._id)},{
                $set:{
                    transaction:[{
                        referreredMoney:100,
                        username:username
                        
                      }],
                     
                    
                },
                 $inc:{
                amount:100
            }
            }
          

            )
            
        }else{
            let walleObj ={
                userid:userid,
                amount:100,
                bonus:true,
                transaction:[{
                  referreredMoney:100,
                  username:username
                  
                }]
            }
            db.get().collection(collections.WALLETCOLLECTION).insertOne(walleObj).then(()=>{
                resolve({status:true})
            })
        }
        resolve({status:true})
     }else{
        resolve({status:false})
     }
    })
},
returnTransaction:(amount,userid,orderid)=>{
    console.log('ingett varindoooooooo');
    return new Promise(async (resolve,reject)=>{
        let cancelObj={
            amount:amount,
            orderid:orderid
        }
        let user= await db.get().collection(collections.WALLETCOLLECTION).findOne({userid:objectId(userid)})
        
        console.log('user evideeeee');

           console.log(user);
       
        if(user.cancel){
console.log('ivdee ethyoooooooo');
            db.get().collection(collections.WALLETCOLLECTION).updateOne({userid:objectId(userid)},{
                $push:{
                    cancel:cancelObj
                }
                
             
            })
            resolve()
        }else{

        
        db.get().collection(collections.WALLETCOLLECTION).updateOne({userid:objectId(userid)},{
            $set:{
                cancel:[cancelObj]
            }
            
         
        })
        resolve()
    }

   
    })
},
withdraw:(orderid,amount,userid)=>{
    return new Promise(async (resolve,reject)=>{
        let cancelObj={
            withdrawamount:amount,
            orderedid:orderid,
            
        }
        let user= await db.get().collection(collections.WALLETCOLLECTION).findOne({userid:objectId(userid)})
        if(user.cancel){

            db.get().collection(collections.WALLETCOLLECTION).updateOne({userid:objectId(userid)},{
                $push:{
                    cancel:cancelObj
                }
                
             
            })

        }else{

        
        db.get().collection(collections.WALLETCOLLECTION).updateOne({userid:objectId(userid)},{
            $set:{
                cancel:[cancelObj]
            }
            
         
        })
    }
    resolve()
    })
},
cancelOrder:(orderid)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collections.ORDERCOLLECTION).updateOne({_id:ObjectId(orderid)},{
        $set:{
            status:'canceled'
        }
      })
    db.get().collection(collections.ORDERCOLLECTION).findOne({_id:objectId(orderid)}).then((result)=>{
        resolve(result)
    })
      
    })
}



}


