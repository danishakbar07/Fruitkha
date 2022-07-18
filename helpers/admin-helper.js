const { promise, reject } = require("bcrypt/promises");
const collections = require("../config/collections");
var db = require("../config/connections");
const userHelper = require("./user-helper");
var objectId = require('mongodb').ObjectId
module.exports={
    addProduct:(product,callback)=>{
        product.price=parseInt(product.price)
        
        

              db.get().collection(collections.PRODUCTCOLLECTION).insertOne(product).then((data)=>{
                  console.log(data);  
                callback(data.insertedId)
             
            })
        

    },
    getallUsers:()=>{
        return new Promise(async (resolve,reject)=>{
           await db.get().collection(collections.USER_COLLECTION).find().toArray().then((data)=>{
                resolve(data)

            })
        })
    },
    blockUsers:(userId)=>{
        
        return new Promise ((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).updateOne( {_id:objectId(userId)},{$set:{status:false}}).then((data)=>{
                resolve(true)
            }).catch(()=>{
                reject()
            })
        })
    },
    unblockUsers:(userId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).updateOne( {_id:objectId(userId)},{$set:{status:true}}).then((data)=>{
                resolve(true)
            })
        }).catch(()=>{
            reject()
        })

        },
        getallProducts:()=>{
            return new Promise (async (resolve,reject)=>{
             await   db.get().collection(collections.PRODUCTCOLLECTION).find().toArray().then((data)=>{
                    resolve(data)
                })
            })

        },
        deleteProduct:(userId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collections.PRODUCTCOLLECTION).deleteOne({_id:objectId(userId)}).then((result)=>{
                    resolve(result)
                })
            }).catch(()=>{
                reject()
            })
        },
        getProduct:(userId)=>{
            return new Promise((reslove)=>{
             db.get().collection(collections.PRODUCTCOLLECTION).findOne({_id:objectId(userId)}).then((response)=>{
                 reslove(response)
             }).catch(()=>{
                reject()
             })
            
            
        
     
            })
     
},
upadateProduct:(product,id)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.PRODUCTCOLLECTION).updateOne({_id:objectId(id)},{$set:{name:product.name,
            description:product.description,
            category:product.category,
            expire_date:product.expire_date,
            stock:product.stock}}).then((data)=>{
                resolve(data)
            }).catch(()=>{
                reject()
            })

    })
    
},
addcategory:(category)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORYCOLLECTION).insertOne(category).then((data)=>{
                resolve(data) 

        })

   
      
   
  })
},
getallCategory:()=>{
    return new Promise (async (resolve,reject)=>{
     await   db.get().collection(collections.CATEGORYCOLLECTION).find().toArray().then((data)=>{
            resolve(data)
        })
    })
},
getCategory:(userId)=>{
    return new Promise((reslove)=>{
     db.get().collection(collections.CATEGORYCOLLECTION).findOne({_id:objectId(userId)}).then((response)=>{
         reslove(response)
     }).catch(()=>{
        reject()
     })
    
    


    })

},
 upadateCategory:(category,id)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.CATEGORYCOLLECTION).updateOne({_id:objectId(id)},{$set:{name:category.name}}).then((data)=>{
                resolve(data)
            }).catch(()=>{
                reject()
            })

    })
    
},
deleteCategory:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.CATEGORYCOLLECTION).deleteOne({_id:objectId(userId)}).then((result)=>{
            resolve(result)
        })
    }).catch(()=>{
        reject()
    })
},
orderedlist:()=>{
    return new Promise(async (resolve,rejcet)=>{
      let orderlist= await db.get().collection(collections.ORDERCOLLECTION).aggregate([
            {
                $lookup:{
                 from:collections.PRODUCTCOLLECTION,
                 localField:'products.item',
                 foreignField:'_id',
                 as:'product'
                 
                },
               
              
             },
             {
                $lookup:{
                 from:collections.USER_COLLECTION,
                 localField:'user',
                 foreignField:'_id',
                 as:'user'
                 
                },
               
              
             },
             { $sort : { date : -1 } }
        ]).toArray()
    
        
         resolve(orderlist)
    })

},
orderCancel:(orderid)=>{
    return new Promise(async (resolve,reject)=>{
        

    

       
        db.get().collection(collections.ORDERCOLLECTION).updateOne({_id:objectId(orderid)},{
            $set:{
                status:'canceled'
            }
        }).then((response)=>{
            response.status=true
            
            resolve(response)
        })
  
    })
},
changestatus:(body)=>{
    
    console.log(body);
    return new Promise(async(resolve,reject)=>{
        let check = await db.get().collection(collections.ORDERCOLLECTION).findOne({_id:objectId(body.orderid)})
        if(check.status!='canceled'){

        
        db.get().collection(collections.ORDERCOLLECTION).updateOne({_id:objectId(body.orderid)},{
            $set:{
                status:body.status
            }
        }).then((response)=>{
            response.status=true
            resolve(response)
                
        }).catch(()=>{
            reject()
        })
    }else{
        resolve({status:false})
    }
    })
},

getTotalorderscount:()=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.ORDERCOLLECTION).find().count().then((response)=>{
          
          console.log(response);
            resolve(response)
        })
        
    })
},
getAllamount:()=>{
    return new Promise(async (resolve,reject)=>{

        

  let total= await db.get().collection(collections.ORDERCOLLECTION).aggregate([
    {
        $match:{
            status
            :'placed'}
    },
      {
        $group:{
                _id:null,
                totals:{
                    $sum:"$price",
                    
                }
        },
    
      }

     
    ]).toArray()
    console.log("kuvaaa kuvaaaa");
         console.log(total);
         if(total[0]){
            resolve(total[0].totals)
         }else{
            resolve(0)
         }
       

    
})
},
addOffer:(offers)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.OFFERCOLLECTION).insertOne(offers).then((result)=>{
            resolve(result)
        })
    })
},
getOffers:()=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.OFFERCOLLECTION).find().toArray().then((result)=>{
            resolve(result)
        })
    })
},
setOffer:(proId,offer)=>{
    console.log('heyy');
    return new Promise(async(resolve,reject)=>{
        let product= await db.get().collection(collections.PRODUCTCOLLECTION).findOne({_id:objectId(proId)})
        let offers= await db.get().collection(collections.OFFERCOLLECTION).findOne({_id:objectId(offer.offer)})
        offerPrice=(product.price*offers.offer)/100
        priceoffer=product.price-offerPrice
        db.get().collection(collections.PRODUCTCOLLECTION).updateOne({_id:objectId(proId)},{
            $set:{
                offerprice:offerPrice,
                offerpercentage:offers.offer,
                offerstatus:true,
                discountPrice:priceoffer
            


            }

        }).then((result)=>{
            console.log('huhuhuhuuh');
            console.log(result);
            resolve(result)
        })


    })
},
codAmount:()=>{
    return new Promise(async(resolve,reject)=>{
        let total= await db.get().collection(collections.ORDERCOLLECTION).aggregate([
            {
                $match:{
                    paymentmethod
                     :'COD',
                    status:'placed' }
            },
            {
              $group:{
                      _id:null,
                      totals:{
                          $sum:"$price",
                          
                      }
              },
          
            }
      
           
          ]).toArray()
          if(total[0]){
            resolve(total[0].totals)
          }else{
            resolve(0)
          }
               
            
    })
},
razorpayAmount:()=>{
    return new Promise(async(resolve,reject)=>{
        let total= await db.get().collection(collections.ORDERCOLLECTION).aggregate([
            {
                $match:{
                    paymentmethod
                    :'razorpay',
                    status:'placed'}
            },
            {
              $group:{
                      _id:null,
                      totals:{
                          $sum:"$price",
                          
                      }
              },
          
            }
      
           
          ]).toArray()
          console.log("kuvaaa kuvaaaa");
               console.log(total);
               if(total[0]){
                resolve(total[0].totals)

               }else{
                resolve(0)
               }
              

    })
},
paypalAmount:()=>{
    return new Promise(async (resolve,reject)=>{
        let total= await db.get().collection(collections.ORDERCOLLECTION).aggregate([
            {
                $match:{
                    paymentmethod
                    :'paypal',
               status:'placed' }
            },
            {
              $group:{
                      _id:null,
                      totals:{
                          $sum:"$price",
                          
                      }
              },
          
            }
      
           
          ]).toArray()
        if(total[0]){
            resolve(total[0].totals)
        }else{
       resolve(0)
        }
               console.log(total);
              
    })
},
removeOffer:(proId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.PRODUCTCOLLECTION).updateOne({_id:objectId(proId)},{
            $set:{
                offerprice:0,
                offerpercentage:0,
                offerstatus:false,
                discountPrice:0
            }
        }).then((response)=>{
            resolve(response)
        })
    })
},
addCoupon:(body)=>{
    body.status=false
    return new Promise((resolve,reject)=>{

        body.offer=parseInt(body.offer)
        db.get().collection(collections.COUPONCOLLECTION).insertOne(body).then((result)=>{
            resolve(result)
        })
    })
},
getCoupons:()=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.COUPONCOLLECTION).find().toArray().then((result)=>{
            resolve(result)
        })
    })
},
salesDetails:(from,to,type)=>{
    return new Promise(async(resolve,reject)=>{
     let details= await   db.get().collection(collections.ORDERCOLLECTION).aggregate([
         {
            $match:{
                status:type,
                date:{$gte:from,$lte:to}
                
            },
        
         
          
        },
  
         
           {
            $lookup:{
                from:collections.USER_COLLECTION,
                localField:'user',
                foreignField:'_id',
                as:'user'
            }
           },
           {
            $lookup:{
                from:collections.PRODUCTCOLLECTION,
                localField:'products.item',
                foreignField:'_id',
                as:'product'
            }
           }

        ]).toArray()
        resolve(details)
    })
}
}
