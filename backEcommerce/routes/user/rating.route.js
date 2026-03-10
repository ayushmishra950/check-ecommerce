const express = require("express");
const router = express.Router();
const { addRating, getProductRatings, getUnratedProducts, getShopRatings, updateRating, deleteRating } = require("../../controllers/user/rating.controller");

router.post("/add", addRating);
router.get("/allProduct", getProductRatings);
router.get("/product", getUnratedProducts);
router.get("/shop/:shopId", getShopRatings);
router.put("/update", updateRating);
router.delete("/delete/:id", deleteRating);

module.exports = router;