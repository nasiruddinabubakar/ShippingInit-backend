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


const loginUser=(user,callback)=>{

const {mail,password} = user;
con.query(`select * from customer where email='${mail}'`,(err,result)=>{
// console.log(result);
  bcrypt.compare(password, result[0].Password, (err, isMatch) => {
    if (err) {
      // Handle the error, e.g., return an error response.
      callback(err,null);
    } else if (isMatch) {
      // The passwords match. Allow the user to log in.
     callback(null,result[0]);
    } else {
      // The passwords do not match. Deny access or show an error message.
     callback( new Error("password failed"),null);
    }
  });
})

}

module.exports = { saveUser,loginUser };
// 
// console.log("hellooo");
