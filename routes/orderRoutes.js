const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const jwtToken = "db-project";

const router = express.Router();

router.get("/orders",verifyToken,(req,res)=>{


})


function verifyToken(req,res,next){

    let token = req.headers['authorization'];
   
    if(token){

        jwt.verify(token, jwtToken, (err, decoded) => {
            if (err) {
              // Token verification failed
              console.error("Token verification failed:", err);
            } else {
              // Token verification succeeded, 
              console.log("User ID:", decoded.Customer_id);
            }
          })
    }
next();
}

module.exports =router;