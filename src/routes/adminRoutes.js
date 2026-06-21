const express = require("express");
const { listUsers, updateUserRole, getPlatformSnapshot } = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/auth");
const { ROLE } = require("../utils/roles");

const router = express.Router();

router.get("/users", authenticate, authorize(ROLE.SUPER_ADMIN), listUsers);
router.patch("/users/:userId/role", authenticate, authorize(ROLE.SUPER_ADMIN), updateUserRole);
router.get("/activity", authenticate, authorize(ROLE.SUPER_ADMIN), getPlatformSnapshot);

module.exports = router;