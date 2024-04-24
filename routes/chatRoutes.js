const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const jwtToken = "db-project";
const geolib = require("geolib");
const util = require("util");
const { getUserChats } = require("../controllers/chatController");
const router = express.Router();


router.get('/get-user-chats',async (req,res)=>{
    console.log(req.headers);
    const userID = req.headers["userid"];

    const companyData = await getUserChats(userID);

    return res.status(200).json(companyData);
})

module.exports = router;