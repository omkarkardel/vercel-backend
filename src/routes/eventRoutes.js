const express = require("express");
const {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  listJoinedEvents,
  addGalleryImage,
  getEventRecommendationsForUser
} = require("../controllers/eventController");
const { authenticate, authorize } = require("../middleware/auth");
const { ROLE } = require("../utils/roles");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.get("/", listEvents);
router.get("/recommendations", authenticate, getEventRecommendationsForUser);
router.get("/joined/me", authenticate, listJoinedEvents);
router.get("/:eventId", getEventById);
router.post("/", authenticate, authorize(ROLE.CLUB_ADMIN, ROLE.SUPER_ADMIN), createEvent);
router.post("/:eventId/rsvp", authenticate, authorize(ROLE.STUDENT, ROLE.CLUB_ADMIN), rsvpEvent);
router.patch("/:eventId", authenticate, authorize(ROLE.CLUB_ADMIN, ROLE.SUPER_ADMIN), updateEvent);
router.delete("/:eventId", authenticate, authorize(ROLE.CLUB_ADMIN, ROLE.SUPER_ADMIN), deleteEvent);
router.post(
  "/:eventId/gallery",
  authenticate,
  authorize(ROLE.CLUB_ADMIN, ROLE.SUPER_ADMIN),
  upload.single("image"),
  addGalleryImage
);

module.exports = router;
