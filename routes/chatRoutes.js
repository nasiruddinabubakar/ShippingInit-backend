const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const jwtToken = "db-project";
const geolib = require("geolib");
const util = require("util");
const { getUserChats } = require("../controllers/chatController");
const router = express.Router();


router.get('/get-user-chats',async (req,res)=>{

    const userID = req.header["userID"];

    const companyData = await getUserChats(userID);

    return res
})