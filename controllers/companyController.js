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

module.exports = { saveCompany };
