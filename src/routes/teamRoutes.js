const express = require("express");
const { createTeam, joinTeam, listTeams, getTeammateSuggestions } = require("../controllers/teamController");
const { authenticate, authorize } = require("../middleware/auth");
const { ROLE } = require("../utils/roles");

const router = express.Router();

router.get("/", authenticate, listTeams);
router.get("/suggestions/:eventId", authenticate, authorize(ROLE.STUDENT, ROLE.CLUB_ADMIN), getTeammateSuggestions);
router.post("/", authenticate, authorize(ROLE.STUDENT, ROLE.CLUB_ADMIN), createTeam);
router.post("/:teamId/join", authenticate, authorize(ROLE.STUDENT, ROLE.CLUB_ADMIN), joinTeam);

module.exports = router;