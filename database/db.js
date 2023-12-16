const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });
const con = mysql.createConnection({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "myDB",
   port: 3306,
});

module.exports = con;
