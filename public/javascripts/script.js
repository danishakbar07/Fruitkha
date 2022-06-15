


function addtoCart(proId){
    swal("Added", "Your product has been added to the cart", "success")
    $.ajax({
        url:'/users/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){ 
               
                    let count=$("#cart-count").html()
                    count =parseInt(count)+1
                    $("#cart-count").html(count)
    

                

               
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
                        console.log(response.total);
                        response.total=response.total+50
                        console.log(response.total);
                        document.getElementById(proId).innerHTML=quantity+count
                        document.getElementById(productName).innerHTML=price*(quantity+count)
                        document.getElementById('subtotala').innerHTML=response.subtotal
                        document.getElementById('totala').innerHTML=response.total
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
            if(response.status){
                location.href='/order-success/'+response.insertedId
            }else{
                razorpayPayment(response)
            }
            
        } 
    })
    
 })
 function razorpayPayment(order){
    var options = {
        "key": "rzp_test_ha6TgI31z1G1Ys", // Enter the Key ID generated from the Dashboard
        "amount": "order.amount", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Fruitkha",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            alert(response.razorpay_payment_id);
            alert(response.razorpay_order_id);
            alert(response.razorpay_signature)
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
        method:'post'
    })
}


 
 
       
            
            
    
      

    
        
    
    


       
    
function alertbox(){
    
        
}