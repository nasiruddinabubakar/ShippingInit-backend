const express = require("express");
const con = require("../database/db");
const { saveUser } = require("../controllers/userController");
const router = express.Router();

router.post("/register", (req, res) => {
  const newuser = req.body;

  saveUser(newuser, (err, result) => {
    if (err) {
      return res.status(500).json("Error creating user");
    }
    delete newuser.password;
    res.status(200).json({ status: "success", newuser });
  });
});

module.exports = router;

// console.log(newuser);
// res.status(200).json(newuser);
//   // con.connect((err) => {
//   //   if (err) {
//   //     console.log(err);
//   //   } else {
//   //     con.query("select * from students", (err, result) => {
//   //       return res.status(200).json({ status: "success", data: result });

//   //     });
//   //   }
//   // });

//   // res.status(200).json("user created successfully");
