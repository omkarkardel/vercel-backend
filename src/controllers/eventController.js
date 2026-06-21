const Event = require("../models/Event");
const User = require("../models/User");
const Club = require("../models/Club");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const apiResponse = require("../utils/apiResponse");
const { createNotification } = require("../services/notificationService");
const { getEventRecommendations } = require("../services/recommendationService");
const { ROLE } = require("../utils/roles");

const buildMapLink = (venue) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue || "")}`;

const listEvents = asyncHandler(async (req, res) => {
  const { category, club, startDate, endDate, search } = req.query;

  const query = {};

  if (category) query.category = category;
  if (club) query.club = club;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const events = await Event.find(query)
    .sort({ date: 1 })
    .populate("club", "name")
    .populate("createdBy", "name role")
    .lean();

  return res.json(apiResponse({ events }, "Events fetched"));
});

const getEventById = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId)
    .populate("club", "name description")
    .populate("attendees", "name email role skills")
    .lean();

  if (!event) {
    return next(new ApiError(404, "Event not found"));
  }

  return res.json(apiResponse({ event }, "Event details fetched"));
});

const createEvent = asyncHandler(async (req, res, next) => {
  const { title, description, category, date, venue, club, maxAttendees } = req.body;

  if (!title || !description || !category || !date || !venue) {
    return next(new ApiError(400, "Missing required event fields"));
  }

  let clubId = club;

  if (req.user.role === ROLE.CLUB_ADMIN) {
    const adminUser = await User.findById(req.user.userId).select("club name");

    if (adminUser?.club) {
      clubId = adminUser.club;
    } else {
      // Fallback for old users where User.club wasn't set but club.admin is correct.
      const ownedClub = await Club.findOne({ admin: req.user.userId }).select("_id");
      if (ownedClub) {
        clubId = ownedClub._id;
        await User.findByIdAndUpdate(req.user.userId, { $set: { club: ownedClub._id } });
      } else {
        // Bootstrap: create a default club for this admin so publishing can proceed.
        const defaultClub = await Club.create({
          name: `${adminUser?.name || "Campus"} Club ${String(req.user.userId).slice(-4)}`,
          description: "Auto-created club profile for admin event publishing.",
          admin: req.user.userId,
          members: [req.user.userId],
          tags: ["general"]
        });

        clubId = defaultClub._id;
        await User.findByIdAndUpdate(req.user.userId, { $set: { club: defaultClub._id } });
      }
    }
  }

  if (req.user.role === ROLE.SUPER_ADMIN && !clubId) {
    const firstClub = await Club.findOne().sort({ createdAt: 1 }).select("_id");

    if (firstClub) {
      clubId = firstClub._id;
    } else {
      const adminOwnedClub = await Club.create({
        name: "Platform Events Club",
        description: "Auto-created club profile for super admin event publishing.",
        admin: req.user.userId,
        members: [req.user.userId],
        tags: ["platform"]
      });

      clubId = adminOwnedClub._id;
    }
  }

  if (!clubId) {
    return next(new ApiError(400, "Club is required"));
  }

  const clubDoc = await Club.findById(clubId);
  if (!clubDoc) {
    return next(new ApiError(404, "Club not found"));
  }

  if (req.user.role === ROLE.CLUB_ADMIN && String(clubDoc.admin) !== req.user.userId) {
    return next(new ApiError(403, "You can only create events for your club"));
  }

  const event = await Event.create({
    title,
    description,
    category,
    date,
    venue,
    club: clubId,
    createdBy: req.user.userId,
    maxAttendees,
    mapLink: buildMapLink(venue)
  });

  await createNotification({
    roleTarget: "all",
    type: "event_created",
    message: `New event posted: ${event.title}`,
    targetModel: "Event",
    targetId: event._id
  });

  return res.status(201).json(apiResponse({ event }, "Event created"));
});

const updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return next(new ApiError(404, "Event not found"));
  }

  const isOwner = String(event.createdBy) === req.user.userId;
  if (req.user.role === ROLE.CLUB_ADMIN && !isOwner) {
    return next(new ApiError(403, "Only event creator can edit this event"));
  }

  const payload = { ...req.body };
  if (payload.venue) {
    payload.mapLink = buildMapLink(payload.venue);
  }

  const updated = await Event.findByIdAndUpdate(req.params.eventId, payload, {
    new: true,
    runValidators: true
  });

  return res.json(apiResponse({ event: updated }, "Event updated"));
});

const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return next(new ApiError(404, "Event not found"));
  }

  const isOwner = String(event.createdBy) === req.user.userId;
  if (req.user.role === ROLE.CLUB_ADMIN && !isOwner) {
    return next(new ApiError(403, "Only event creator can delete this event"));
  }

  await Event.findByIdAndDelete(req.params.eventId);

  return res.json(apiResponse({}, "Event deleted"));
});

const rsvpEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return next(new ApiError(404, "Event not found"));
  }

  if (event.attendees.some((id) => String(id) === req.user.userId)) {
    return next(new ApiError(409, "You already registered for this event"));
  }

  if (event.attendees.length >= event.maxAttendees) {
    return next(new ApiError(400, "Event registration is full"));
  }

  event.attendees.push(req.user.userId);
  await event.save();

  await User.findByIdAndUpdate(req.user.userId, { $addToSet: { joinedEvents: event._id } });

  await createNotification({
    recipient: req.user.userId,
    type: "event_registered",
    message: `You have registered for ${event.title}`,
    targetModel: "Event",
    targetId: event._id
  });

  return res.json(apiResponse({ eventId: event._id }, "Registration successful"));
});

const listJoinedEvents = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).populate({
    path: "joinedEvents",
    populate: { path: "club", select: "name" }
  });

  return res.json(apiResponse({ events: user?.joinedEvents || [] }, "Joined events fetched"));
});

const addGalleryImage = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return next(new ApiError(404, "Event not found"));
  }

  if (!req.file) {
    return next(new ApiError(400, "Image is required"));
  }

  const imagePath = `/uploads/${req.file.filename}`;
  event.gallery.push(imagePath);
  await event.save();

  return res.json(apiResponse({ gallery: event.gallery }, "Gallery image added"));
});

const getEventRecommendationsForUser = asyncHandler(async (req, res) => {
  const recommendations = await getEventRecommendations(req.user.userId);
  return res.json(apiResponse({ recommendations }, "Recommendations generated"));
});

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  listJoinedEvents,
  addGalleryImage,
  getEventRecommendationsForUser
};
