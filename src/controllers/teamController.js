const Team = require("../models/Team");
const User = require("../models/User");
const Event = require("../models/Event");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const apiResponse = require("../utils/apiResponse");
const { suggestTeammates } = require("../services/recommendationService");

const createTeam = asyncHandler(async (req, res, next) => {
  const { name, event, requiredSkills = [], maxMembers = 5 } = req.body;

  if (!name || !event) {
    return next(new ApiError(400, "Team name and event are required"));
  }

  const eventDoc = await Event.findById(event);
  if (!eventDoc) {
    return next(new ApiError(404, "Event not found"));
  }

  const creator = await User.findById(req.user.userId);

  const team = await Team.create({
    name,
    event,
    requiredSkills,
    maxMembers,
    creator: req.user.userId,
    members: [
      {
        user: req.user.userId,
        skills: creator?.skills || []
      }
    ]
  });

  return res.status(201).json(apiResponse({ team }, "Team created"));
});

const joinTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.teamId);

  if (!team) {
    return next(new ApiError(404, "Team not found"));
  }

  if (team.members.some((member) => String(member.user) === req.user.userId)) {
    return next(new ApiError(409, "Already a team member"));
  }

  if (team.members.length >= team.maxMembers) {
    return next(new ApiError(400, "Team is full"));
  }

  const user = await User.findById(req.user.userId);

  team.members.push({ user: req.user.userId, skills: user?.skills || [] });
  await team.save();

  return res.json(apiResponse({ team }, "Joined team"));
});

const listTeams = asyncHandler(async (req, res) => {
  const { eventId } = req.query;
  const query = eventId ? { event: eventId } : {};

  const teams = await Team.find(query)
    .populate("event", "title date")
    .populate("creator", "name")
    .populate("members.user", "name email skills")
    .sort({ createdAt: -1 })
    .lean();

  return res.json(apiResponse({ teams }, "Teams fetched"));
});

const getTeammateSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await suggestTeammates(req.user.userId, req.params.eventId);
  return res.json(apiResponse({ suggestions }, "Teammate suggestions generated"));
});

module.exports = {
  createTeam,
  joinTeam,
  listTeams,
  getTeammateSuggestions
};