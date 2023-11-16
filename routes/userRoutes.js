const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const jwtToken = "db-project";
const { saveUser, loginUser } = require("../controllers/userController");
const router = express.Router();

router.post("/register", async(req, res) => {
  const newuser = req.body;

  con.query(
    `select * from customer where email= '${newuser.mail}'`,
    (err, result) => {
      if (err) {
        return res
          .status(400)
          .json({ status: "failed", message: "error creating account" });
      }

      if (result.length > 0) {
        return res
          .status(400)
          .json({ status: "failed", message: "email already exists" });
      }

      // If the email is not found, proceed to save the user.
      saveUser(newuser, (err, result) => {
        if (err) {
          return res.status(500).json("Error creating user");
        }
        delete newuser.password;
        jwt.sign({ result }, jwtToken, { expiresIn: "2h" }, (err, token) => {
          res.status(200).json({ status: "success", auth: token, newuser });
        });
      });
    }
  );
});

router.post("/login", (req, res) => {
  const newuser = req.body;
 
  loginUser(newuser, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({status:"failed",message:"Invalid Email or password"});
    }
    delete newuser.password;
    const {Customer_id}=result;
    console.log(Customer_id);
    jwt.sign({ Customer_id }, jwtToken, { expiresIn: "2h" }, (err, token) => {
      res.status(200).json({ status: "success", auth: token, newuser });
    });
  });
});
module.exports = router;
