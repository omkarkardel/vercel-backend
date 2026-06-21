const express = require("express");
const {
  listClubs,
  createClub,
  updateClub,
  deleteClub,
  sendAnnouncement,
  getClubRegistrations,
  getMyClubAnalytics
} = require("../controllers/clubController");
const { authenticate, authorize } = require("../middleware/auth");
const { ROLE } = require("../utils/roles");

const router = express.Router();

router.get("/", authenticate, listClubs);
router.post("/", authenticate, authorize(ROLE.SUPER_ADMIN), createClub);
router.patch("/:clubId", authenticate, authorize(ROLE.SUPER_ADMIN), updateClub);
router.delete("/:clubId", authenticate, authorize(ROLE.SUPER_ADMIN), deleteClub);

router.get("/admin/registrations", authenticate, authorize(ROLE.CLUB_ADMIN), getClubRegistrations);
router.get("/admin/analytics", authenticate, authorize(ROLE.CLUB_ADMIN), getMyClubAnalytics);
router.post("/admin/announcements", authenticate, authorize(ROLE.CLUB_ADMIN), sendAnnouncement);

module.exports = router;