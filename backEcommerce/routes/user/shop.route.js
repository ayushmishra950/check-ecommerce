const express = require("express");
const router = express.Router();
const {getShop} = require("../../controllers/user/shop.controller");

router.get("/get-shop", getShop);

module.exports = router;