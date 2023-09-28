const express = require("express");
const mysql = require("mysql");
const app = express();
const { v4: uuidv4 } = require("uuid");
var bcrypt = require("bcryptjs");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "fast123",
  database: "sys",
  port: 8000,
});
app.use(express.json());

const saveUser = (user) => {
  const {id, name, email, password } = user;
  const query = "INSERT INTO users (user_id,name, email, password) VALUES (?, ?, ?, ?)";
  const values = [id,name, email, password];

  con.query(query, values, (err, result) => {
    if (err) {
      console.error("Error saving user:", err);
      return;
    }
    console.log("User saved successfully");
  });
};
const registeruser = (req, res) => {
  const newuser = req.body;
  newuser.id = Number(newuser.id);
  newuser.id = uuidv4();
 
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      console.error('Error generating salt:', err);
      return res.status(500).json('Error creating user');
    }

    bcrypt.hash(newuser.password, salt, function (err, hash) {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json('Error creating user');
      }
      newuser.password = hash;
      
      saveUser(newuser);
  res.status(200).json("user created succexxfully");
});
});
};
app.route("/users/register").post(registeruser);
app.listen("5000", () => {
  console.log("listening on port 5000");
});
