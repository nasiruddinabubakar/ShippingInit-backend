const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const jwtToken = "db-project";
const geolib = require("geolib");
const router = express.Router();
const {
  saveCompany,
  loginCompany,
  getDetails,
} = require("../controllers/companyController");

let companyID;
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
        companyID = decoded.user_id;
      }
    });
  }
  next();
}

router.post("/register", async (req, res) => {
  const newCompany = req.body;

  try {
    // Check if the email already exists
    const [existingUser] = await con.query(
      "SELECT * FROM user WHERE email = ?",
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
    const user_id = result.company_id;
    const token = jwt.sign({ user_id }, jwtToken, { expiresIn: "2h" });
    return res
      .status(200)
      .json({ status: "Success", auth: token, data: result });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(400).json({ status: "failed", message: error.message });
  }
});

router.get("/getdetails", verifyToken, async (req, res) => {
  const details = await getDetails(companyID);

  let distance =
    geolib.getDistance(
      { latitude: 32.4279, longitude: 53.688 },
      { latitude: 35.8617, longitude: 104.1954 }
    ) / 1000;

  console.log(
    `The distance between the two locations is ${distance} kilometers.`
  );

  return res.status(200).json({ data: details });
});

module.exports = router;
