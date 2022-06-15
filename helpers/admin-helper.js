const { promise } = require("bcrypt/promises");
const collections = require("../config/collections");
var db = require("../config/connections");
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
            })
        })
    },
    unblockUsers:(userId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).updateOne( {_id:objectId(userId)},{$set:{status:true}}).then((data)=>{
                resolve(true)
            })
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
            })
        },
        getProduct:(userId)=>{
            return new Promise((reslove)=>{
             db.get().collection(collections.PRODUCTCOLLECTION).findOne({_id:objectId(userId)}).then((response)=>{
                 reslove(response)
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
     })
    
    


    })

},
upadateCategory:(category,id)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.CATEGORYCOLLECTION).updateOne({_id:objectId(id)},{$set:{name:category.name}}).then((data)=>{
                resolve(data)
            })

    })
    
},
deleteCategory:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.CATEGORYCOLLECTION).deleteOne({_id:objectId(userId)}).then((result)=>{
            resolve(result)
        })
    })
}
}