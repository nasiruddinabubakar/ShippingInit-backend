const express = require("express");
const multer = require("multer");
const util = require("util");
const con = require("../database/db");
const router = express.Router();
const storage = multer.memoryStorage();
const { v4: uuidv4 } = require("uuid");
const query = util.promisify(con.query).bind(con);
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
      time: 0,
    };
  });

  const response = await Promise.all(promises); //await apiRequest.json();
  let prevTime = 0,
    currTime = 0;
  const len = response.length;
  let times = [];
  for (let i = 0; i < len - 1; i++) {
    currTime = Math.round(
      calculateDistance(
        response[i].latlng[0],
        response[i].latlng[1],
        response[i + 1].latlng[0],
        response[i + 1].latlng[1]
      ) /
        25 /
        24
    );
    console.log(response[i].country, response[i + 1].country, currTime);
    currTime += prevTime;
    prevTime = currTime;
    response[i + 1].time = currTime;
  }

  const startCountry = response[0].country;

  const routeID = uuidv4();
  const shipID = "0153eb28-3fc1-4158-8d3e-7ee2488ed33f";
  await query(
    "Insert into route (route_id, ship_id, start_country,no_lags) values (?, ?, ?, ?)",
    [routeID, shipID, startCountry, len - 1]
  );

  for (var i = 1; i <= len - 1; i++) {
    await query(
      "Insert into `Lag` (route_id, lag_id, lag_no, country, time) values(?, ?, ?, ?, ?)",
      [routeID, uuidv4(), i, response[i].country, response[i].time]
    );
  }
  return res.status(200).json(response);
});

router.post("/route", async (req, res) => {
  const { pickup, dropoff } = req.body;

  try {
    const result = await query(
      "SELECT s.ship_id, s.name, s.image, (l2.time - l1.time) AS timeTaken FROM Ship s JOIN Route r ON s.ship_id = r.ship_id JOIN Lag l1 ON r.route_id = l1.route_id JOIN Lag l2 ON r.route_id = l2.route_id WHERE  (l1.country = ? AND l2.country = ?) AND CURRENT_DATE <= s.start_date + INTERVAL l1.time DAY AND  l2.lag_no > l1.lag_no",
      [pickup, dropoff]
    );

    return res.json({ status: "success", ships: result });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Error getting ships" });
  }
});

module.exports = router;
