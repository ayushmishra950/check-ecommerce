const router = require("express").Router();
const {getDashboardSummary, handleGetOverview} = require("../../controllers/admin/dashboard.controller");



router.get("/dashboardsummary", getDashboardSummary);
router.get("/dashboardoverveiw", handleGetOverview)


module.exports = router;