const con = require("../database/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const saveUser = (user, callback) => {

    user.id = uuidv4();
  const {id, name, email, password } = user;


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
      const query = "INSERT INTO users (user_id, name, email, password) VALUES (?, ?, ?, ?)";
      const values = [id, name, email, hash];

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
