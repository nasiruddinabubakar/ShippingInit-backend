const util = require("util");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const con = require("../database/db");

const query = util.promisify(con.query).bind(con);

const saveCompany = async (company) => {
  try {
    const id = uuidv4();
    const { name, mail, password, phone_no, address } = company;
    console.log(company);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userQuery =
      "INSERT INTO `USER` (user_id, email, password, role) VALUES (?, ?, ?, ?)";
    const userValues = [id, mail, hash, "company"];

    await query(userQuery, userValues);

    const companyQuery =
      "INSERT INTO `COMPANY` (company_id, name, phone_number, country, sales, user_id) VALUES (?, ?, ?, ?, ?, ?)";
    const companyValues = [uuidv4(), name, phone_no, address, 0, id];

    await query(companyQuery, companyValues);

    console.log("User and Company details saved successfully");
  } catch (error) {
    console.error("Error saving company:", error);

    throw new Error("Error saving company");
  }
};

const loginCompany = async (company) => {
  const { mail, password } = company;

  const userResult = await query("SELECT * FROM `USER` WHERE email = ?", [mail]);

  if (userResult.length === 0) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, userResult[0].password);

  if (isMatch) {
    const userID = userResult[0].user_id;
    const companyResult = await query(
      "SELECT * FROM `company` WHERE user_id = ?",
      [userID]
    );

    if (companyResult.length > 0) {
      return companyResult[0];
    } else {
      throw new Error("No Company Data found!");
    }
  } else {
    throw new Error("Password doesn't match");
  }
};

const getDetails = async (companyID) => {
  const companyData = {
    noShips: 0,
    noOrders: 0,
    noCustomers: 0,
    sales: 0,
    ships: []
  };

  const shipResult = await query(
    "select (s.ship_id) countas no_ships from ship s where s.company_id = ? ",
    [companyID]
  );
  companyData.noShips = shipResult[0].no_ships;

  const orderResult = await query(
    "SELECT COUNT( b.booking_id) AS order_count from booking b  JOIN Ship s ON b.ship_id = s.ship_id JOIN company co ON s.company_id = co.company_id WHERE co.company_id = ?",
    [companyID]
  );
  companyData.noOrders = orderResult[0].order_count;
  const customerResult = await query(
    "SELECT COUNT(DISTINCT c.customer_id) AS customer_count FROM customer c JOIN booking b ON c.customer_id = b.customer_id JOIN Ship s ON b.ship_id = s.ship_id JOIN Company co ON s.company_id = co.company_id WHERE co.company_id = ?",
    [companyID]
  );
  companyData.noCustomers = customerResult[0].customer_count;
  const salesResult = await query(
    "SELECT sales from company where company_id = ?",
    [companyID]
  );
    companyData.sales = salesResult[0].sales;
  const shipsDetails = await query(
    "select name, currentWeight, capacity, start_country, route_id from ship join route on ship.ship_id=route.ship_id where company_id = ?",
    [companyID]
  );

  const ships = shipsDetails.map(async (item) => {
    const remainingRoutes = await query(
      "select country from `lag` where route_id = ? order by lag_no;",
      [item.route_id]
    );

    companyData.ships.push({item, remainingRoutes});

    console.log(companyData)
  });
  const response = await Promise.all(ships);
  return companyData;
};

module.exports = { saveCompany, loginCompany, getDetails };