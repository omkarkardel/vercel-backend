const User = require("../models/User");
const Event = require("../models/Event");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const apiResponse = require("../utils/apiResponse");

const getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId)
    .populate("club", "name description")
    .populate("joinedEvents", "title date venue category")
    .lean();

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  return res.json(apiResponse({ user }, "Profile fetched"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, interests, skills, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $set: {
        ...(name ? { name } : {}),
        ...(interests ? { interests } : {}),
        ...(skills ? { skills } : {}),
        ...(avatar ? { avatar } : {})
      }
    },
    { new: true }
  ).lean();

  return res.json(apiResponse({ user }, "Profile updated"));
});

const getStudentDashboard = asyncHandler(async (req, res) => {
  const [upcomingEvents, joinedEvents] = await Promise.all([
    Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(8)
      .populate("club", "name")
      .lean(),
    User.findById(req.user.userId)
      .populate({ path: "joinedEvents", populate: { path: "club", select: "name" } })
      .lean()
  ]);

  return res.json(
    apiResponse(
      {
        upcomingEvents,
        joinedEvents: joinedEvents?.joinedEvents || []
      },
      "Student dashboard fetched"
    )
  );
});

module.exports = {
  getCurrentUser,
  updateProfile,
  getStudentDashboard
};