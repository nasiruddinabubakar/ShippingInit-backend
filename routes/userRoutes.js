const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const jwtToken = "db-project";
const router = express.Router();

const { saveUser, loginUser } = require("../controllers/userController");

router.post("/register", async (req, res) => {
  try {
    const newuser = req.body;

    const [result] = await con.query("select * from user where email= ?", [
      newuser.mail,
    ]);

    if (result.length > 0) {
      return res
        .status(400)
        .json({ status: "failed", message: "email already exists" });
    }

    const newUser = await saveUser(newuser);
    delete newUser.password;
    const id = newUser.id;
    const token = jwt.sign({ id }, jwtToken, { expiresIn: "2h" });

    res.status(200).json({ status: "success", auth: token, newuser });
  } catch (err) {
    console.error("Error occured in Creating user", err);
    res
      .status(400)
      .json({ status: "Failed", message: "Internal Server Error!" });
  }
});

router.post("/login", (req, res) => {
  const newuser = req.body;

  loginUser(newuser, (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ status: "failed", message: "Invalid Email or password" });
    }
    delete newuser.password;
    const { user_id } = result;
    console.log(user_id);
    jwt.sign({ user_id }, jwtToken, { expiresIn: "2h" }, (err, token) => {
      res.status(200).json({ status: "success", auth: token, newuser });
    });
  });
});
module.exports = router;
