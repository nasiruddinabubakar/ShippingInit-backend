const con = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const util = require('util');

const query = util.promisify(con.query).bind(con);


export const getUserChats = async (userID)=>{

    const result = await query("Select * from `company` join user on user.user_id = company.user_id where user_id = ?",[userID])

    return result;
}
