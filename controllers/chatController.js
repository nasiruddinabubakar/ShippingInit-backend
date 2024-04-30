const con = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const util = require('util');

const query = util.promisify(con.query).bind(con);

const getUserChats = async (userID) => {
  console.log(userID);
  try {
    const result = await query(
      `SELECT 
      c.user_id AS user_id,
      c.name AS name,
      m.message AS last_message
  FROM 
      company c
  JOIN 
      ship s ON c.company_id = s.company_id
  JOIN 
      booking b ON s.ship_id = b.ship_id
  JOIN 
      customer cu ON b.customer_id = cu.customer_id
  JOIN 
      messages m ON (m.sender_id = cu.user_id OR m.recipient_id = cu.user_id)
  WHERE 
      cu.user_id = ?
      AND (m.sender_id = cu.user_id OR m.recipient_id = cu.user_id)
      AND m.timestamp = (
          SELECT MAX(timestamp)
          FROM messages
          WHERE (sender_id = cu.user_id OR recipient_id = cu.user_id)
              AND (sender_id = c.user_id OR recipient_id = c.user_id)
      )
  GROUP BY 
      c.user_id, c.name
  ORDER BY 
      MAX(m.timestamp) DESC;
  `,
      [userID]
    );
    console.log(result);
    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
};
const getCompanyChats = async (companyID) => {
  try {
    const result = await query(
      `
      SELECT 
          c.user_id AS company_user_id,
         
          cu.user_id AS customer_user_id,
          cu.name AS customer_name,
          m.message AS last_message
      FROM 
          company c
      JOIN 
          ship s ON c.company_id = s.company_id
      JOIN 
          booking b ON s.ship_id = b.ship_id
      JOIN 
          customer cu ON b.customer_id = cu.customer_id
      JOIN 
          messages m ON (m.sender_id = cu.user_id OR m.recipient_id = cu.user_id)
      WHERE 
          c.user_id = ?
          AND (m.sender_id = cu.user_id OR m.recipient_id = cu.user_id)
          AND m.timestamp = (
              SELECT MAX(timestamp)
              FROM messages
              WHERE (sender_id = cu.user_id OR recipient_id = cu.user_id)
                  AND (sender_id = c.user_id OR recipient_id = c.user_id)
          )
      GROUP BY 
          c.user_id, c.name, cu.user_id, cu.name
      ORDER BY 
          MAX(m.timestamp) DESC;
      `,
      [companyID]
    );
    console.log(result);
    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
};
module.exports = { getUserChats, getCompanyChats };
