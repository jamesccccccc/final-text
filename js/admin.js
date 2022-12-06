let orderData=[];
const orderList=document.querySelector('.js-orderList');
const deleteAllBtn=document.querySelector('.discardAllBtn');
function init(){
    getOrders();
    renderC3_lv2();
}
init();
//C3.js圖表
function renderC3(){
  let totalObj={}
  orderData.forEach(item=>{
      item.products.forEach(produtsItem=>{
          if(totalObj[produtsItem.category]==undefined){
            totalObj[produtsItem.category]=produtsItem.price*produtsItem.quantity;
          }else{
            totalObj[produtsItem.category]+=produtsItem.price*produtsItem.quantity;
          }
      })
  })
  let newData=[]
  let area=Object.keys(totalObj)
  area.forEach((item,index)=>{
       let ary=[]
       ary.push(item)
       ary.push(totalObj[item])
       newData.push(ary);
  })
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
         type: "pie",
         columns: newData,
            colors:{
            "Louvre 雙人床架":"#DACBFF",
            "Antony 雙人床架":"#9D7FEA",
            "Anty 雙人床架": "#5434A7",
            "其他": "#301E5F",
            }       
        },
    });
}
//C3.js Lv2圖表
function renderC3_lv2(){
   //資料蒐集
   let obj={}
   orderData.forEach(item=>{
      item.products.forEach(productsItem=>{
          if(obj[productsItem.title]==undefined){
            obj[productsItem.title]=productsItem.quantity*productsItem.price;
          }else{
            obj[productsItem.title]+=productsItem.quantity*productsItem.price;
          }
      })     
   })
   //拉出資料關聯
   let originAry=Object.keys(obj);
   //透過originAry.整理成C3格式
   let rankSoryAry=[];
   originAry.forEach(item=>{
      let ary=[];
      ary.push(item);
      ary.push(obj[item]);
      rankSoryAry.push(ary);
   })
   //比大小,降幕排列(目的:取營收前三高的品項當主要色塊,把其餘的品項加總起來當成一個色塊)
   rankSoryAry.sort((a,b)=>{
         return b[1] - a[1]; 
   })
   //如果超過4筆以上,就統整為其他
   if(rankSoryAry.length>3){
      let otherTotal=0;
      rankSoryAry.forEach((item,index)=>{
         if(index>2){
           otherTotal+=rankSoryAry[index][1];
         }
      })
      rankSoryAry.splice(3,rankSoryAry.length-1);
      rankSoryAry.push(['其他',otherTotal]);
   }
   //超過三筆後將第四名之後的價格加總起來放在otherTotal
   //c3圖表
   let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
         type: "pie",
         columns: rankSoryAry,
            colors:{
            "Louvre 雙人床架":"#DACBFF",
            "Antony 雙人床架":"#9D7FEA",
            "Anty 雙人床架": "#5434A7",
            "其他": "#301E5F",
            }       
        },
    });
}
//取得訂單資訊
function getOrders(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'authorization':token,
        }
    })
    .then(response=>{
    //取得訂單數量 
        orderData=response.data.orders;
        let str=''
        orderData.forEach(item=>{
             //組時間狀態
             const thisStamp=new Date(item.createdAt*1000);
             const thisTime=`${thisStamp.getFullYear()}/${thisStamp.getMonth()+1}/${thisStamp.getDate()}`;
            //組產品字串
            let productsStr=''
            item.products.forEach(productItem=>{
            productsStr+=`<p>${productItem.title}x${productItem.quantity}</p>`
        })
    //取得訂單狀態
            let orderStats=''
            if(item.paid==true){
                orderStats='已處理'
            }else{
                orderStats='未處理'
            }
            str+=`<tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
              ${productsStr}
            </td>
            <td>${thisTime}</td>
            <td class="orderStatus">
              <a  href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStats}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
            </td>
        </tr>`  
        })
        orderList.innerHTML=str
        renderC3();
        renderC3_lv2();
    })
}
//判斷訂單按鈕跟刪除按鈕
orderList.addEventListener('click',function(e){
   e.preventDefault();
   const targetClass=e.target.getAttribute('class');
   let id=e.target.getAttribute('data-id');
   if(targetClass=="delSingleOrder-Btn"){
      deleteOrder(id)
     return
   }
   if(targetClass=="orderStatus"){
    let status=e.target.getAttribute('data-status');
    changeOrder(status,id);
    return
 }
})
//修改訂單狀態
function changeOrder(status,id){
    let newStast;
    if(status==true){
        newStast=false
    }else{
        newStast=true
    }
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${ api_path}/orders`,{
    "data": {
        "id":id,
        "paid":newStast
      }
    },
    {
    headers:{
        'authorization':token,
        }   
    })
    .then(response=>{
        getOrders();
    })
}
//刪除單筆訂單
function deleteOrder(id){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${ api_path}/orders/${id}`,{
    headers:{
        'authorization':token,
        }   
  })
  .then(response=>{
      getOrders();
  })
}
//刪除所有訂單
deleteAllBtn.addEventListener('click',function(e){
   e.preventDefault();
   axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${ api_path}/orders/`,{
    headers:{
      'authorization':token,
      }
   })
   .then(response=>{
    getOrders();
   })
})
