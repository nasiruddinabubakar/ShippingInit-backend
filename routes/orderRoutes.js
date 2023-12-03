const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/nodeMailer");
const jwtToken = "db-project";
const {
  saveOrder,
  getDetails,
  getCompanyOrders,
} = require("../controllers/orderController");

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
router.get("/companyhistory", verifyToken, async (req, res) => {
  try {
    const orders = await getCompanyOrders(userID);
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

router.get("/:myVar", verifyToken, async (req, res) => {
  const myVar = req.params.myVar;
  console.log(myVar);
  try {
    const orderDetail = await query(
      "select weight_in_tonne, ship.name,email from booking join cargo on booking.cargo_id=cargo.cargo_id join ship on booking.ship_id=ship.ship_id join company on ship.company_id = company.company_id join user on company.user_id=user.user_id where booking_id = ?",
      [myVar]
    );
    console.log(orderDetail[0]);
    return res.status(200).json({ status: "success", booking: orderDetail[0] });
  } catch (err) {
    console.error(err.meesage);
    return res
      .status(500)
      .json({ status: "failed", message: "Error fetching details" });
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
