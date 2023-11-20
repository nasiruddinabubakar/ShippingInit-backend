const con = require("../database/db");

const saveOrder=(order,callback)=>{


    console.log(order);
    return callback(null,order);
    


}

module.exports=saveOrder;