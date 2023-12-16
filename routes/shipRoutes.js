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
  async (req, res) => {
    try {
      const imageBuffer = req.files["image"][0].buffer;
      console.log(req.body);
      console.log("hello");
      console.log(imageBuffer.length);
      const companyID = req.headers.companyid;
      const name = req.body.name;
      const capacity = req.body.capacity;
      const model = req.body.model;
      const price = req.body.price;
      // Process other text fields from the body
      const ship_id = uuidv4();

      con.beginTransaction();
      let sql =
        "INSERT INTO ship (ship_id, company_id, name,image, capacity, build_year, currentWeight, start_date, price_per_tonne,is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,? )";
      await query(sql, [
        ship_id,
        companyID,
        name,
        imageBuffer,
        capacity,
        model,
        0,
        new Date(),
        Number(price),
        0
      ]);

      let routesArr = req.body.terminal.split(",");
      console.log(routesArr);

      const promises = routesArr.map(async (country) => {
        console.log(country);
        const apiRequest = await fetch(
          "https://restcountries.com/v3.1/name/" +
            country +
            "?fullText=true&fields=latlng"
        );
        const response = await apiRequest.json();
        console.log(response);

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
      const sql2 =
        "INSERT INTO route (route_id, ship_id, start_country, no_lags) VALUES (?, ?, ?, ?)";
      await query(sql2, [routeID, ship_id, startCountry, len - 1]);

      const sql3 = 0;
      for (var i = 1; i <= len - 1; i++) {
        await query(
          "INSERT INTO `Lag` (lag_id, route_id, lag_no, country, time) VALUES (?, ?, ?, ?, ?)",
          [uuidv4(), routeID, i, response[i].country, response[i].time]
        );
      }
      con.commit();
      return res.status(200).json({ status: "Success", message: "Ship added" });
    } catch (Error) {
      console.error(Error.message);
    }
  }
);

router.get("/getships", (req, res) => {
  const { shipid } = req.headers;
  console.log(shipid);
  con.query(
    "select s.*,user.email,company.name as 'Company_Name', company.country,company.phone_number,route.start_country, COUNT(booking.booking_id)as 'no_booking' from `ship` s join `COMPANY` on s.company_id=company.company_id join booking on booking.ship_id = s.ship_id join `USER` on company.user_id=user.user_id join route on s.ship_id=route.ship_id where s.ship_id = ?",
    [shipid],
    (err, result, fields) => {
      if (err) {
        console.error(err);
      }

      return res.status(200).json(result[0]);
    }
  );
});
//delete ship
router.delete("/deleteship", (req, res) => {
  const { shipid } = req.headers;
  console.log("hello")
  con.query(
    "DELETE FROM `lag` WHERE route_id IN (SELECT route_id FROM route WHERE ship_id = ?)",
    [shipid],
    (err, respond) => {
      if (err) {
        return err;
      }
    }
  );

  con.query(
    "DELETE FROM route WHERE ship_id = ?",
    [shipid],
    (err, respond) => {
      if (err) {
        return err;
      }
    }
  );

  con.query(
    "DELETE FROM ship WHERE ship_id = ?",
    [shipid],
    (err, respond) => {
      if (err) {
        return err;
      }
        return res.status(200).json({messege: "deleted"});
      
    }
  );
});
router.post("/availableship", (req, res)=>{
  const { shipid } = req.headers;
  console.log("hello")
  con.query("UPDATE ship SET is_deleted = 0 WHERE ship_id = ?", [shipid], (err, respond)=>{
    if(err){
      console.log(err)
    }
    return res.status(200).json({messege: "messege"});
  })
});

router.post("/unavailableship", (req, res)=>{
  console.log("hello")
  const { shipid } = req.headers;
  con.query("UPDATE ship SET is_deleted = 1 WHERE ship_id = ?", [shipid], (err, respond)=>{
    if(err){
      console.log(err)
    }
    return res.status(200).json({messege: "messege"});
  })
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
  console.log(pickup, dropoff);
  try {
    const result = await query(
      "SELECT s.ship_id, s.name, s.image, (l2.time - l1.time) AS timeTaken FROM `ship` s JOIN `route` r ON s.ship_id = r.ship_id JOIN `lag` l1 ON r.route_id = l1.route_id JOIN `lag` l2 ON r.route_id = l2.route_id WHERE  (l1.country = ? AND l2.country = ?) AND CURRENT_DATE <= s.start_date + INTERVAL l1.time DAY AND  l2.lag_no > l1.lag_no and s.is_deleted=?",
      [pickup, dropoff,0]
    );

    if (result.length > 0) {
      return res.json({ status: "success", ships: result });
    } else {
      const newResult = await query(
        "SELECT distinct s.ship_id, s.name, s.image, (l1.time) AS timeTaken FROM Ship s JOIN Route r ON s.ship_id = r.ship_id JOIN Lag l1 ON r.route_id = l1.route_id JOIN Lag l2 ON r.route_id = l2.route_id WHERE  (r.start_country = ? AND l1.country = ?) AND (CURRENT_DATE <= s.start_date + INTERVAL l1.time DAY) AND s.is_deleted=?",
        [pickup, dropoff,0]
      );
      console.log(newResult);
      if (newResult.length > 0) {
        return res.json({ status: "success", ships: newResult });
      } else {
        return res.json({ status: "failed", ships: [] });
      }
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Error getting ships" });
  }
});

module.exports = router;