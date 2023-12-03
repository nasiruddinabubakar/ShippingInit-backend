const util = require("util");
const con = require("../database/db");
const { v4: uuidv4 } = require("uuid");
const query = util.promisify(con.query).bind(con);

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
  try {
    con.beginTransaction();
    await query(
      "Insert into Cargo(cargo_id, consignee_name, weight_in_tonne, type, description, fragile) values (?,?,?,?,?,?)",
      [
        cargoId,
        consigneeName,
        orderWeight,
        orderType,
        orderDescription,
        fragile,
      ]
    );
    const updateWeightQuery =
      "UPDATE Ship SET currentWeight = currentWeight + ? WHERE ship_id = ?";
    const updateWeightValues = [orderWeight, shipId];
    const updateWeightResult = await query(
      updateWeightQuery,
      updateWeightValues
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
    con.commit();
  } catch (err) {
    con.rollback();
    console.error(err);
  }
  return;
};

const getDetails = async (userID) => {
  try{
  const result = await query(
    "Select Customer_id from Customer where user_id = ?",
    [userID]
  );
  const customerId = result[0].Customer_id;

  console.log(customerId);
  await query("CALL UpdateDeliveredStatusNew()");
  const orders = await query(
    "SELECT booking_id,consignee_name, pickup, dropoff,delivered FROM booking JOIN customer ON booking.customer_id = customer.customer_id JOIN cargo ON booking.cargo_id = cargo.cargo_id WHERE customer.customer_id = ?",
    [customerId]
  );
  return orders;
  }catch(Err){
    console.error(Err.message);
  }

};
const getCompanyOrders = async (userId) =>{
  try{
    const querry = "SELECT * FROM `booking` WHERE `ship_id` In (SELECT `ship_id` FROM `company` JOIN `ship` ON `company`.`company_id` = `ship`.`company_id` WHERE `company`.`company_id` = ?)";
    
    const orders = await query(querry, [userId]);
    console.log(orders)
    return orders;
  }catch(error){
    console.log(error)
  }
}

module.exports = { saveOrder, getDetails,getCompanyOrders };
