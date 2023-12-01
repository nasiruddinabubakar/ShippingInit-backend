const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/nodeMailer");
const jwtToken = "db-project";
const { saveOrder, getDetails } = require("../controllers/orderController");

const util = require("util");
const query = util.promisify(con.query).bind(con);
const router = express.Router();
let userID = null;
router.get("/history", verifyToken, async (req, res) => {
  try {
    const orders = await getDetails(userID);
    return res.status(200).json({ status: "success", orders });
  } catch (err) {
    console.error(err.message);
    return res.json("Internal Server Error");
  }
});
router.post("/neworder", verifyToken, async (req, res) => {
  const order = req.body;

  try {
    await saveOrder(order, userID);
    const result = await query("Select email from user where user_id = ?", [
      userID,
    ]);
    sendMail(result[0].email);
    console.log("order Confirmed");

    return res
      .status(200)
      .json({ status: "success", message: "Order Confirmed" });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ status: "failed", message: "Unknown Error Occurred!" });
  }
});

function verifyToken(req, res, next) {
  let token = req.headers["authorization"];

  if (token) {
    jwt.verify(token, jwtToken, (err, decoded) => {
      if (err) {
        // Token verification failed
        console.error("Token verification failed:", err);
        return res
          .status(400)
          .json({ status: "failed", meesage: "Token failed." });
      } else {
        // Token verification succeeded,
        console.log("User ID:", decoded.user_id);
        userID = decoded.user_id;
      }
    });
  }
  next();
}

module.exports = router;
