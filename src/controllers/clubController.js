const Club = require("../models/Club");
const User = require("../models/User");
const Event = require("../models/Event");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const apiResponse = require("../utils/apiResponse");
const { getClubAnalytics } = require("../services/analyticsService");
const { createNotification } = require("../services/notificationService");

const listClubs = asyncHandler(async (_req, res) => {
  const clubs = await Club.find().populate("admin", "name email").lean();
  return res.json(apiResponse({ clubs }, "Clubs fetched"));
});

const createClub = asyncHandler(async (req, res, next) => {
  const { name, description, admin, tags = [] } = req.body;

  if (!name || !description || !admin) {
    return next(new ApiError(400, "Name, description and admin are required"));
  }

  const adminUser = await User.findById(admin);
  if (!adminUser) {
    return next(new ApiError(404, "Admin user not found"));
  }

  const club = await Club.create({
    name,
    description,
    admin,
    members: [admin],
    tags
  });

  adminUser.role = "club_admin";
  adminUser.club = club._id;
  await adminUser.save();

  return res.status(201).json(apiResponse({ club }, "Club created"));
});

const updateClub = asyncHandler(async (req, res, next) => {
  const club = await Club.findById(req.params.clubId);
  if (!club) {
    return next(new ApiError(404, "Club not found"));
  }

  const updated = await Club.findByIdAndUpdate(req.params.clubId, req.body, {
    new: true,
    runValidators: true
  });

  return res.json(apiResponse({ club: updated }, "Club updated"));
});

const deleteClub = asyncHandler(async (req, res, next) => {
  const club = await Club.findById(req.params.clubId);
  if (!club) {
    return next(new ApiError(404, "Club not found"));
  }

  await Event.deleteMany({ club: club._id });
  await User.updateMany({ club: club._id }, { $set: { club: null } });
  await Club.findByIdAndDelete(club._id);

  return res.json(apiResponse({}, "Club and linked events deleted"));
});

const sendAnnouncement = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  if (!message) {
    return next(new ApiError(400, "Announcement message is required"));
  }

  const sender = await User.findById(req.user.userId);
  if (!sender?.club) {
    return next(new ApiError(400, "Club admin profile is not linked to a club"));
  }

  const club = await Club.findById(sender.club).populate("members", "_id");
  if (!club) {
    return next(new ApiError(404, "Club not found"));
  }

  await Promise.all(
    club.members.map((member) =>
      createNotification({
        recipient: member._id,
        type: "announcement",
        message,
        targetModel: "Club",
        targetId: club._id
      })
    )
  );

  return res.json(apiResponse({}, "Announcement sent to club members"));
});

const getClubRegistrations = asyncHandler(async (req, res, next) => {
  const sender = await User.findById(req.user.userId);
  if (!sender?.club) {
    return next(new ApiError(400, "Club admin profile is not linked to a club"));
  }

  const events = await Event.find({ club: sender.club })
    .populate("attendees", "name email role")
    .sort({ date: 1 })
    .lean();

  return res.json(apiResponse({ events }, "Event registrations fetched"));
});

const getMyClubAnalytics = asyncHandler(async (req, res, next) => {
  const sender = await User.findById(req.user.userId);
  if (!sender?.club) {
    return next(new ApiError(400, "Club admin profile is not linked to a club"));
  }

  const analytics = await getClubAnalytics(sender.club);
  return res.json(apiResponse({ analytics }, "Club analytics fetched"));
});

module.exports = {
  listClubs,
  createClub,
  updateClub,
  deleteClub,
  sendAnnouncement,
  getClubRegistrations,
  getMyClubAnalytics
};