const express = require("express");
const multer = require("multer");
const con = require("../database/db");
const router = express.Router();
const storage = multer.memoryStorage();
const { v4: uuidv4 } = require("uuid");

const geolib = require("geolib");

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
      "INSERT INTO ship (ship_id, company_id, name,image, capacity, build_year, currentWeight) VALUES (?, ?, ?, ?, ?, ?, ?)";
    con.query(
      sql,
      [
        uuidv4(),
        "a757dbb0-9f6c-4186-b6f1-c9a55d6dcd9c",
        name,
        imageBuffer,
        capacity,
        build_year,
        0,
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
  con.query("select * from ship", (err, result, fields) => {
    if (err) {
      console.error(err);
    }

    return res.status(200).json(result[0]);
  });
});

const calculateDistance = (x1, y1, x2, y2) => {
  return (
    geolib.getDistance(
      { latitude: x1, longitude: y1 },
      { latitude: x2, longitude: y2 }
    ) / 1000
  );
};

router.post("/newship", async (req, res) => {
  let routesArr = req.body;

  const promises = routesArr.map(async (country) => {
    const apiRequest = await fetch(
      `https://restcountries.com/v3.1/name/${country}?fullText=true&fields=latlng`
    );
    const response = await apiRequest.json();

    return {
      country,
      latlng: response[0].latlng,
      time:0
    };
  });

  const response = await Promise.all(promises); //await apiRequest.json();

  const len = response.length;
  let times = [];
  for (let i = 0; i < len-1; i++) {

    response[i+1].time= calculateDistance(
      response[i].latlng[0],
      response[i].latlng[1],
      response[i + 1].latlng[0],
      response[i + 1].latlng[1]
    )/25;
  }

  return res.status(200).json(response);
});

module.exports = router;
