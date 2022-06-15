var db = require("../config/connections");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { promise } = require("bcrypt/promises");
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: 'rzp_test_ha6TgI31z1G1Ys',
  key_secret: 'VvqGcPV08orTYX2bhKQ5a6FY',
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
    getProductCategory:(userId)=>{
        return new Promise((reslove)=>{
         db.get().collection(collection.PRODUCTCOLLECTION).find({category:userId}).toArray().then((response)=>{
             response
             reslove(response)
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
                $push:{products:proObj }

                
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
                $pull:{products:{item:objectId(data.product) }}
            }).then((response)=>{
                resolve({removeProduct:true})
            })

        }else{
            db.get().collection(collection.CARTCOLLECTION).updateOne({_id:objectId(data.cart),'products.item':objectId(data.product)},{
                $inc:{
                     'products.$.quantity':data.count
                }
            }).then(()=>{
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
placeOrder:(details,products,price)=>{
    let status=details.paymentmethod==='COD'?'placed':'Pending'
    let orderObj={
        deliveryDetails:{
            name:details.name,
            email:details.email,
            address:details.address,

            phoneno:details.phone,
            pincode:details.pincode


        },
       user:objectId(details.userid),
       products:products,
       paymentmethod:details.paymentmethod,
       price:price,
       status:status ,
       date:new Date

    }
    return new  Promise((resolve,reject)=>{
        db.get().collection(collection.ORDERCOLLECTION).insertOne(orderObj).then((response)=>{
            db.get().collection(collection.CARTCOLLECTION).deleteOne({user:objectId(details.userid)})
            resolve(response)
        })

    })
  
 
},
orderlist:(orderId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDERCOLLECTION).find({_id:objectId(orderId)}).toArray().then((result)=>{
            resolve(result)

        })
    })
},
orderProducts:(orderId)=>{
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
    console.log("thairrrrrrrrrrrrrr");
    console.log(orderId);
    return new Promise((resolve,reject)=>{
        var options = {
            amount: total,  
            currency: "INR",
            receipt:""+ orderId
          };
          instance.orders.create(options, function(err, order) {
            console.log("paymentttttttttttttt");
            console.log(order);
            resolve(order)
    
          });

    })
  
},
verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
        
    })

}
}


