const express = require("express");
const { saveUser } = require("../controllers/userController");
const router = express.Router();

router.post("/register", (req, res) => {
  const newuser = req.body;

  saveUser(newuser, (err, result) => {
    if (err) {
      return res.status(500).json('Error creating user');
    }
    res.status(200).json("User created successfully");
  });
});

module.exports = router;
