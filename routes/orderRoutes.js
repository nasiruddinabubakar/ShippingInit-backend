const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/nodeMailer");
const jwtToken = "db-project";
const saveOrder = require("../controllers/orderController");
const router = express.Router();
let userID = null;
router.get("/history", verifyToken, (req, res) => {});
router.post("/neworder", verifyToken, async (req, res) => {
  const order = req.body;

  try {
    await saveOrder(order, userID);

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
