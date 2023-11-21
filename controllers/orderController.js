const util = require("util");
const con = require("../database/db");
const { v4: uuidv4 } = require("uuid");
const query = util.promisify(con.query).bind(con);

// order: {
//     consigneeName: "", // String
//     orderWeight: 0, // Number (assuming it's a weight value)
//     orderType: "", // String
//     orderDescription: "",
//     fragile: false, // Boolean (assuming it's a flag)
//   }, // String
//   route: {
//     shipId: "", // Stringw
//     pickup: "", // String
//     dropoff: "", // String
//   },
// };

const saveOrder = async (order, userID) => {

  const { consigneeName, orderWeight, orderType, orderDescription, fragile } =
    order.order;
  const { shipId, pickup, dropoff } = order.route;
  console.log();
  const result = await query(
    "Select Customer_id from Customer where user_id = ?",
    [userID]
  );
  const customerId = result[0].Customer_id;
  const cargoId = uuidv4();
  try{
  await query(
    "Insert into Cargo(cargo_id, consignee_name, weight_in_tonne, type, description, fragile) values (?,?,?,?,?,?)",
    [cargoId, consigneeName, orderWeight, orderType, orderDescription, fragile]
  );

  await query(
    "INSERT INTO booking(booking_id, booking_date, delivery_date, pickup, dropoff, ship_id, cargo_id, customer_id, delivered) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      uuidv4(),
      new Date(),
      new Date(),
      pickup,
      dropoff,
      shipId,
      cargoId,
      customerId,
      0, // Assuming 'delivered' is a boolean column and you're inserting 0 for false
    ]
  );
  
}
catch(err){
    console.error(err);
}
  return;
};



module.exports = saveOrder;
