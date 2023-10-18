const con = require("../database/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const saveUser = (user, callback) => {

    const id = uuidv4();
  const { name, mail, password } = user;

console.log(id);
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      console.error('Error generating salt:', err);
      return callback(err, null) ;
    }

    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        console.error('Error hashing password:', err);
        return callback(err, null);
      }
      const query = "INSERT INTO customer (Customer_id, Name, Email, Password) VALUES (?, ?, ?, ?)";
      const values = [id, name, mail, hash];

      con.query(query, values, (err, result) => {
        if (err) {
          console.error("Error saving user:", err);
          return callback(err, null);
        }
        console.log("User saved successfully");
        callback(null, result);
      });
    });
  });
};

module.exports = { saveUser };
