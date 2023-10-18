const mysql = require("mysql");
const dotenv =require ("dotenv");

dotenv.config({path:'../.env'});
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "myDB",
  //   port: 8000,
});


module.exports = con;
