const express = require("express");
const router = express.Router();
const {  createBanner, getAllBanners,  getActiveBanners,  updateBanner,  deleteBanner,   changeBannerStatus,} = require("../../controllers/admin/banner.controller");
const upload = require("../../cloudinary/upload");


    router.post("/add", upload.fields([ { name: "image", maxCount: 1 }]), createBanner);
    router.get("/get", getAllBanners);
    router.get("/active", getActiveBanners);
    router.put("/update/:id", upload.fields([ { name: "image", maxCount: 1 }]), updateBanner);
    router.delete("/delete/:id", deleteBanner);
    router.patch("/status/:id", changeBannerStatus);


module.exports = router;