const User = require("../models/User");
const Event = require("../models/Event");
const Club = require("../models/Club");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");
const { getPlatformAnalytics } = require("../services/analyticsService");

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return res.json(apiResponse({ users }, "Users fetched"));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { $set: { role } },
    { new: true, runValidators: true }
  );

  return res.json(apiResponse({ user }, "User role updated"));
});

const getPlatformSnapshot = asyncHandler(async (_req, res) => {
  const [analytics, latestUsers, latestClubs, latestEvents] = await Promise.all([
    getPlatformAnalytics(),
    User.find().sort({ createdAt: -1 }).limit(6).lean(),
    Club.find().sort({ createdAt: -1 }).limit(6).lean(),
    Event.find().sort({ createdAt: -1 }).limit(6).lean()
  ]);

  return res.json(
    apiResponse(
      {
        analytics,
        latestUsers,
        latestClubs,
        latestEvents
      },
      "Platform activity fetched"
    )
  );
});

module.exports = {
  listUsers,
  updateUserRole,
  getPlatformSnapshot
};