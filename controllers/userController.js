const con = require("../database/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const saveUser = (user, callback) => {
  const id = uuidv4();
  const { name, mail, password, phone_no, address } = user;

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
      const userValues = [id, mail, hash, "customer"];

      con.query(userQuery, userValues, (err, result) => {
        if (err) {
          console.error("Error saving user:", err);
          return callback(err, null);
        }

        const customerQuery =
          "INSERT INTO customer (customer_id, name, address, phone_no, user_id) VALUES (?, ?, ?, ?, ?)";
        const customerValues = [uuidv4(), name, address, phone_no, id];

        con.query(customerQuery, customerValues, (err, result) => {
          if (err) {
            console.error("Error saving customer details:", err);
            return callback(err, null);
          }

          console.log("User and customer details saved successfully");
          callback(null, result);
        });
      });
    });
  });
};

const loginUser = (user, callback) => {
  const { mail, password } = user;
  console.log(user);

  con.query("SELECT * FROM USER WHERE email = ?", [mail], (err, result) => {
    if (err) {
      console.error("Error fetching user:", err);
      return callback(err, null);
    }

    if (result.length === 0) {
      // User not found in the database.
      return callback(new Error("User not found"), null);
    }

    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return callback(err, null);
      }

      if (isMatch) {
        // The passwords match. Allow the user to log in.
        callback(null, result[0]);
      } else {
        // The passwords do not match. Deny access or show an error message.
        callback(new Error("Password does not match"), null);
      }
    });
  });
};

module.exports = { saveUser, loginUser };
//
// console.log("hellooo");
