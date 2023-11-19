const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const jwtToken = "db-project";
const router = express.Router();
const {
  saveCompany,
  loginCompany,
} = require("../controllers/companyController");

router.post("/register", async (req, res) => {
  const newCompany = req.body;

  try {
    // Check if the email already exists
    const [existingUser] = await con.query(
      'SELECT * FROM user WHERE email = ?',
      [newCompany.mail]
    );

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ status: "failed", message: "Email already exists" });
    }

    // Save the company
    await saveCompany(newCompany);

    return res
      .status(200)
      .json({ status: "success", message: "Account Created Successfully" });
  } catch (error) {
    console.error("Error creating account:", error);
    return res
      .status(500)
      .json({ status: "failed", message: "Error creating account" });
  }
});

router.post("/login", async (req, res) => {
  const company = req.body;

  try {
    const result = await loginCompany(company);

    return res
      .status(200)
      .json({ status: "Success", message: "Login Successful", result });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(400).json({ status: "failed", message: error.message });
  }
});

module.exports = router;
