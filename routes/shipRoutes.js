const express = require("express");
const multer = require("multer");
const con = require("../database/db");
const router = express.Router();
const storage = multer.memoryStorage();
const { v4: uuidv4 } = require("uuid");

const upload = multer({ storage: storage });
router.post(
  "/upload",
  upload.fields([{ name: "image", maxCount: 1 }, { name: "textData" }]),
  (req, res) => {
    const imageBuffer = req.files["image"][0].buffer;

    console.log(imageBuffer.length);
    const { ship_id, name, capacity, build_year } = req.body;
    // Process other text fields from the body
    const sql =
      "INSERT INTO ship (ship_id, company_id, name,image, capacity, build_year) VALUES (?, ?, ?, ?, ?, ?)";
    con.query(
      sql,
      [
        uuidv4(),
        "a757dbb0-9f6c-4186-b6f1-c9a55d6dcd9c",
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

router.get("/getships", (req, res) => {


  con.query("select * from ship",(err,result,fields)=>{

    if (err){

      console.error(err);

    }
    console.log(result);
    return res.status(200).json(result[0]);
  })




  
});

module.exports = router;
