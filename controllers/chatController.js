const con = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const util = require('util');

const query = util.promisify(con.query).bind(con);

const getUserChats = async (userID) => {

  console.log(userID);
  try{
  const result = await query(
    `SELECT DISTINCT c.user_id, c.name FROM company c JOIN ship s ON c.company_id = s.company_id
    JOIN booking b ON s.ship_id = b.ship_id
    JOIN customer cu ON b.customer_id = cu.customer_id
    WHERE cu.user_id = ?`,
    [userID]
  );
  console.log(result);
  return result;
}catch(err){
    console.error(err);
    return [];
}
};
module.exports = { getUserChats };
