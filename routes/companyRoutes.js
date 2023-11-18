const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const { saveCompany } = require("../controllers/companyController");
const jwtToken = "db-project";
const router = express.Router();

router.post("/register", async(req, res) => {
  const newcompany = req.body;
 
  con.query(
    `select * from user where email= '${newcompany.mail}'`,
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

      saveCompany(newcompany, (err, result) => {
        if (err) {
          return res.status(400).json("Error occured!");
        }

        return res
          .status(200)
          .json({ status: "success", message: "Account Created Successfully" });
      });
    }
  );
});




module.exports = router;