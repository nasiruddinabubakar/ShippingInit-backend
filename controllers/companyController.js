const con = require("../database/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const saveCompany = (company, callback) => {
  const id = uuidv4();
  const { name, mail, password, phone_no, country } = company;

  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      console.error("Error generating salt:", err);
      return callback(err, null);
    }

    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        console.error("Error hashing password:", err);
        return callback(err, null);
      }

      const userQuery =
        "INSERT INTO user (user_id, email, password, role) VALUES (?, ?, ?, ?)";
      const userValues = [id, mail, hash, "company"];

      con.query(userQuery, userValues, (err, result) => {
        if (err) {
          console.error("Error saving user:", err);
          return callback(err, null);
        }

        const companyQuery =
          "INSERT INTO Company (company_id, name, phone_number, country, user_id) VALUES (?, ?, ?, ?, ?)";
        const customerValues = [uuidv4(), name, phone_no, country, id];

        con.query(companyQuery, customerValues, (err, result) => {
          if (err) {
            console.error("Error saving customer details:", err);
            return callback(err, null);
          }

          console.log("User and Company details saved successfully");
          callback(null, result);
        });
      });
    });
  });
};

const loginCompany = (company, callback) => {
  const { mail, password } = company;

  const userQuery = "SELECT * from user where email = ?";

  con.query(userQuery, [mail], (err, result) => {
    if (err) {
      return callback(new Error("Error fetching User"), null);
    }

    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return callback(new Error("Error Comparing Password"), null);
      }
      if (isMatch) {
        const userID = result[0].user_id;
        con.query(
          "Select * from Company where user_id = ?",
          [userID],
          (err, companyResult) => {
            if (err) {
              console.error(err);
              return callback(new Error("No Company Data found!"), null);
            }
            return callback(null, companyResult[0]);
          }
        );
      } else {
        return callback(new Error("Password Doesnt Match !"), null);
      }
    });
  });
};

module.exports = { saveCompany, loginCompany };
