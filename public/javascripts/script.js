





function addtoCart(proId){
    
    
    $.ajax({
      
        url:'/users/add-to-cart/'+proId,
        method:'get',
        
        success:(response)=>{
            if(response.status){ 
                 swal("Added", "Your product has been added to the cart", "success")
               
                    let count=$("#cart-count").html()
                    count =parseInt(count)+1
                    $("#cart-count").html(count)
    

                

               
            }
            else{
                location.href='/users/login'
            }
        }
        
    })

}
function checkCart(){
    $.ajax({
        url:'/select-addresses',
        method:'get',
        success:(response)=>{
             if(response.status){
                swal("There is no products in the Cart!!!", "error");
             }else{
                location.href='/select-address'
             }
        }
    })
} 
function changeQuantity(cartId,proId,productName,price,count){
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    // swal({
    //     title: "Are you sure?",
    //     text: "Once deleted, it will be removed from the cart!",
    //     icon: "warning",
    //     buttons: true,
    //     dangerMode: true,
    // }
        
    //   ).then((value)=>{
    //     if(value){
            $.ajax({
       



    
                url:'/change-product-quantity',
                data:{
                    cart:cartId,
                    product:proId,
                    count:count,
                    quantity:quantity
                },
                method:'post',
                success:(response)=>{
                    if(response.removeProduct){
                        swal("Removed", "Your product has been removed", "success").then(()=>{
                            location.reload();
                        });
                    
                      
                            
                       
        
                    }else{
                        
                       
                        document.getElementById(proId).innerHTML=quantity+count
                        document.getElementById(productName).innerHTML=price*(quantity+count)
                        document.getElementById('subtotala').innerHTML=response.subtotal
                        document.getElementById('totala').innerHTML=response.subtotal
                        document.getElementById('offertotal').innerHTML=response.fulloffertotal
                    }
                }
            })
        // }else{
        //     swal("Cancelled", "error");
        // }

     // })

    
  
 }
  function userUnblock(userId){
    swal({
        title: "Are you sure that you want to unblock this user?",
       
        icon: "warning",

        buttons: ["No","Yes"],
        dangerMode: true,
    }
        
      ).then((value)=>{
        if(value){

    $.ajax({
        url:'/admin/users/unblock/'+userId,
        method:'get',
        success:(response)=>{
            if(response.status){
                swal("user is unblocked",{icon:"success"}).then(()=>{
                    location.reload();
                })
                
            
            }
        }
    })
}else{
    swal("Cancelled", "error");

}
      })
   

  }
  function userBlock(userId){
    swal({
        title: "Are you sure want to unblock this user?",
        
        icon: "warning",
        buttons: ["No","Yes"],
        dangerMode: true,
    }
        
      ).then((value)=>{
        if(value){

    $.ajax({
        url:'/admin/users/block/'+userId,
        method:'get',
        success:(response)=>{
            if(response.status){
                swal("user is blocked",{icon:"success"}).then(()=>{
                    location.reload();
                })
                
            }
        }
    })
}else{
    swal("Cancelled", "error");

}
      })
   

  }
  $('#checkout-form').submit((e)=>{
    e.preventDefault()
    
    $.ajax({
        url:'/checkout',
        method:'post',
        data:$('#checkout-form').serialize(),
        success:(response)=>{
            if(response.status=='cod'){
                location.href='/order-success/'+response.insertedId
            }else if(response.status=='razorpay'){

                razorpayPayment(response)
            }else{
                for(let i = 0;i < response.links.length;i++){
                    if(response.links[i].rel == 'approval_url'){
                    location.href=response.links[i].href
                    }
                  }
                
            }

            
            
        } 
    })
    
 })
 
 
 function razorpayPayment(order){
    var options = {
        "key": "rzp_test_ha6TgI31z1G1Ys", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Fruitkha",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
          
            verifyPayment(response,order)
        },
      
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();

}
function verifyPayment(response,order){
    $.ajax({
        url:'/verify-payment',
        data:{
            response,
            order

        },
        method:'post',
        success:(response)=>{
            if(response.status){
                location.href='/order-success/'+response.orderId

            }
        }
    })
}
function cancelOrder(orderid){
    swal({
        title: "Are you sure that you want to cancel this order?",
       
        icon: "warning",

        buttons: ["No","Yes"],
        dangerMode: true,
    }
        
      ).then((value)=>{
        if(value){
            
            $.ajax({
                
                url:'/admin/orderCancel/'+orderid,
              
                method:'get',
                success:(response)=>{
                    alert(response)
                    if(response.status){
                        location.reload()
                        
                    
                        
                    }

                }
            })
        }else{
            swal("Cancelled", "error");

        }
    })

}

    
            
         function productdetails(orderid){
           
           
           
            
            
            $.ajax({
                url:'/view-orders',
                method:'post',
                data:{
                    orderid
                },
                success:(response)=>{
                    if(response.status){
                     location.reload
                     
                    }

                }

            })
       
        
         }  
         $('#passwordchange').submit((e)=>{
            e.preventDefault()
            $.ajax({
                url:'/change-password',
                method:'post',
                data:$('#passwordchange').serialize(),
                success:(response)=>{
                    if(response.status){
                        swal("Changed", "Your password has changed successfully", "success")
                    }else{
                        swal("Error", "your password doesn't match");
                       
                    }
                    
                } 
            })
            
         })
         
         
        function edit(orderid,status){
            $.ajax({
                url:'/admin/editstatus',
                method:'post',
                data:{
                    orderid,
                    status
                },
               
                success:(response)=>{
                    if(response.status){
                        location.reload()
                    }else{
                        swal("The order is already cancelled", "error");
                    }

                }
            })

        }
            
     
    
$('#wallet').submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/addwallet',
        data:$('#wallet').serialize(),
        method:'post',
        success:(response)=>{
          
            if(response.status){
                
                location.href='/user-profile'
            }

        }


    })
})


function removeOffer(proId){
    $.ajax({
        url:'/admin/removeOffer/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                location.reload()
            }

        }
    }

    )
}
 $('#coupon-check').submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/check-coupon',
        data:$('#coupon-check').serialize(),
        method:'post',
        success:(response)=>{
            if(response.status=='true'){
                location.href='/cart'

            }else if (response.status=='already used'){
                document.getElementById('couponerr').innerHTML='Already Used'
            }else if(response.status=='only one'){
                document.getElementById('couponerr').innerHTML='only one coupon can be applied'
            }else{
                document.getElementById('couponerr').innerHTML='invalid Coupon'
            }
        }
    })
 })
 function category(name){

    $.ajax({
        url:'/category/'+name,
        method:'get',
        success:(response)=>{
            if(response.status){
                
                location.reload()
            }
        }
    })
 }

       
 function cancelmyOrder(orderid){
    swal({
        title: "Are you sure that you want to cancel this order?",
       
        icon: "warning",

        buttons: ["No","Yes"],
        dangerMode: true,
    }
        
      ).then((value)=>{
if(value){


      
    $.ajax({
        url:'/cancel/'+orderid,
        method:'get',
        success:(response)=>{
            if(response.status){
                location.reload()
            }
        }

    })
}else{
    swal("Cancelled");
}
})
 }
            
    
      

    
        
    
    


       
