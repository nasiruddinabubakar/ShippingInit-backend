const util = require("util");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const con = require("../database/db");

const query = util.promisify(con.query).bind(con);

const saveCompany = async (company) => {
  try {
    const id = uuidv4();
    const { name, mail, password, phone_no, country } = company;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userQuery = 'INSERT INTO user (user_id, email, password, role) VALUES (?, ?, ?, ?)';
    const userValues = [id, mail, hash, 'company'];

    await query(userQuery, userValues);

    const companyQuery = 'INSERT INTO Company (company_id, name, phone_number, country, user_id) VALUES (?, ?, ?, ?, ?)';
    const companyValues = [uuidv4(), name, phone_no, country, id];

    await query(companyQuery, companyValues);

    console.log('User and Company details saved successfully');
  } catch (error) {
    console.error('Error saving company:', error);
    
    throw new Error('Error saving company');
  }
};


const loginCompany = async (company) => {
  const { mail, password } = company;

  const userResult = await query("SELECT * FROM user WHERE email = ?", [mail]);

  if (userResult.length === 0) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, userResult[0].password);

  if (isMatch) {
    const userID = userResult[0].user_id;
    const companyResult = await query(
      "SELECT * FROM Company WHERE user_id = ?",
      [userID]
    );

    if (companyResult.length > 0) {
      return companyResult[0];
    } else {
      throw new Error("No Company Data found!");
    }
  } else {
    throw new Error("Password doesn't match");
  }
};

module.exports = { saveCompany, loginCompany };
