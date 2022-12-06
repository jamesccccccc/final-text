const productlist=document.querySelector('.productWrap');
const productSelect=document.querySelector('.productSelect');
const cardList=document.querySelector('.shoppingCart-cardList');
const deletAllbtn=document.querySelector('.discardAllBtn');
const orderInfoBtn=document.querySelector('.orderInfo-btn');
let productData=[]
let cartListData=[]
//渲染購物車畫面
function init(){
   getProductList();
   getCartList();
}
init();
//購物車畫面
function getProductList(){
   axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
   .then(response=>{
      productData=response.data.products
      render()
   }) 
   .catch(error=>{
      console.log(error)
   })
}
function combieProductList(item){
   return `<li class="productCard">
   <h4 class="productType">新品</h4>
         <img src="${item.images}" alt="">
         <a href="#" class="js-addCart" id="addCardBtn" data-id="${item.id}">加入購物車</a>
         <h3>${item.title}</h3>
         <del class="originPrice">$${thousands(item.origin_price)}</del>
         <p class="nowPrice">$${thousands(item.price)}</p>
     </li>
     `
}
function render(){
   let str=''
   productData.forEach(item=>{
   str+= combieProductList(item)
   })
   productlist.innerHTML=str
}
//篩選購物車畫面
productSelect.addEventListener('change',function(e){
    const category=e.target.value;
    if(category=="全部"){
      getProductList()
      return
    }
    let str=''
    productData.forEach(item=>{
        if(item.category==category){
         str+=combieProductList(item)
      }
    })
    productlist.innerHTML=str
})
//新增購物車列表
productlist.addEventListener('click',function(e){
   e.preventDefault();
   if(e.target.getAttribute('class')!='js-addCart'){
      return
   }
   let productId=e.target.getAttribute('data-id')
   console.log(productId)
   let numcheck=1
   cartListData.forEach(item=>{
       if(item.product.id==productId){
         numcheck=item.quantity+=1
       }
   })
   axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
      "data":{
         "productId":productId,
         "quantity": numcheck
      }
   })
   .then(response=>{
        console.log(response)
        getCartList();
   })

})
function getCartList(){
   axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
   .then(response=>{
      document.querySelector('.tatol').textContent=thousands(response.data.finalTotal);
      let str=''
      cartListData=response.data.carts
      cartListData.forEach(item=>{
         str+=`
         <tr>
         <td>
             <div class="cardItem-title">
                 <img src="${item.product.images}"alt="">
                 <p>${item.product.title}</p>
             </div>
         </td>
         <td>NT$${thousands(item.product.price)}</td>
         <td>${item.quantity}</td>
         <td>NT$${thousands(item.product.price*item.quantity)}</td>
         <td class="discardBtn">
             <a href="#" class="material-icons" data-id="${item.id}">
                 clear
             </a>
         </td>
     </tr>
         `
      })
      cardList.innerHTML=str
   })   
}
//刪除購物車商品
cardList.addEventListener('click',function(e){
      e.preventDefault();
      const cartId=e.target.getAttribute('data-id');
      if(cartId==null){
         alert('你點到其他東西了')
         return
      }
      axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
      .then(response=>{
         console.log(response)
         getCartList();
      })
})
//刪除購物車全部商品
deletAllbtn.addEventListener('click',function(e){
   e.preventDefault();
   axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
   .then(response=>{
      console.log(response)
      getCartList();
   })
})
//建立訂單
orderInfoBtn.addEventListener('click',function(e){
   e.preventDefault()
   console.log('hello')
   if(cartListData.length==0){
      alert('沒有購物車商品')
      return
   }
   const customerName=document.querySelector('#customerName').value;
   const customerPhone=document.querySelector('#customerPhone').value;
   const customerEmail=document.querySelector('#customerEmail').value;
   const customerAddress=document.querySelector('#customerAddress').value;
   const tradeWay=document.querySelector('#tradeWay').value;
   if(customerName==""||customerPhone==""||customerEmail==""||customerAddress==""||tradeWay==""
   ){
      alert('請勿輸入空資訊');
      return;
   }
   if(validateEmail(customerEmail)==false){
      alert('請填寫正確的Email')
      return;
   }
   if(validatePhone(customerPhone)==false){
      alert('請填寫正確的電話')
      return;
   }
   axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
      "data": {
        "user": {
          "name":customerName,
          "tel": customerPhone,
          "email": customerEmail,
          "address":customerAddress,
          "payment":tradeWay
        }
      }
    }).then(response=>{
      alert('訂單建立成功');
      document.querySelector('#customerName').value="";
      document.querySelector('#customerPhone').value="";
      document.querySelector('#customerEmail').value="";
      document.querySelector('#customerAddress').value="";
      document.querySelector('#tradeWay').value="";
      getCartList();
    })
})
//判斷Email格式
const customerEmail=document.querySelector('#customerEmail');
customerEmail.addEventListener('blur',function(e){
   if(validateEmail(customerEmail.value)==false){
      document.querySelector(`[data-message=Email]`).textContent='請填寫正確Email格式';
      return;
   }
})
//判斷電話號碼
const customerPhone=document.querySelector('#customerPhone');
customerPhone.addEventListener('blur',function(e){
    if(validatePhone(customerPhone.value)==false){
       document.querySelector(`[data-message=電話]`).textContent='請填寫正確的電話號碼'
       return
    }
})
//千分位
function thousands (value) {
   if (value) {
     value += "";
     let arr = value.split(".");
     let re = /(\d{1,3})(?=(\d{3})+$)/g;
 
     return arr[0].replace(re, "$1,") + (arr.length == 2 ? "." + arr[1] : "");
   } else {
     return ''
   }
 }
//驗證Email
function validateEmail(mail) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return true
  }
    return false
}
//驗證電話號碼
function validatePhone(phone){
   if(/^[09]{2}\d{8}$/.test(phone)){
      return true
   }
   return false
}
