const express = require("express");
const multer = require("multer");
const con = require("../database/db");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post(
  "/upload",
  upload.fields([{ name: "image", maxCount: 1 }, { name: "textData" }]),
  (req, res) => {
    const imageBuffer = req.files["image"][0].buffer;
    const { ship_id, name, capacity, build_year } = req.body;
    // Process other text fields from the body
    const sql =
      "INSERT INTO ship (ship_id, company_id, name,image, capacity, build_year) VALUES (?, ?, ?, ?, ?, ?)";
    con.query(
      sql,
      [
        1,
        "613c7ee9-8566-11ee-b900-00e07070c3ee",
        name,
        imageBuffer,
        capacity,
        build_year,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting data into MySQL:", err);
          res.status(500).send("Internal Server Error");
        } else {
          console.log("Data inserted into MySQL");
          res.status(200).send("Form data uploaded successfully");
        }
      }
    );
  }
);

module.exports = router;
