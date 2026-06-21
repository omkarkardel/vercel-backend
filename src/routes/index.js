const express = require("express");

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const clubRoutes = require("./clubRoutes");
const eventRoutes = require("./eventRoutes");
const teamRoutes = require("./teamRoutes");
const notificationRoutes = require("./notificationRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/clubs", clubRoutes);
router.use("/events", eventRoutes);
router.use("/teams", teamRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);

module.exports = router;