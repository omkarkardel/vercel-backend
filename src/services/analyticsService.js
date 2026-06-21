const User = require("../models/User");
const Event = require("../models/Event");
const Club = require("../models/Club");
const Team = require("../models/Team");

const getPlatformAnalytics = async () => {
  const [users, clubs, events, teams, recentEvents] = await Promise.all([
    User.countDocuments(),
    Club.countDocuments(),
    Event.countDocuments(),
    Team.countDocuments(),
    Event.find().sort({ createdAt: -1 }).limit(5).populate("club", "name").lean()
  ]);

  const participation = await Event.aggregate([
    {
      $project: {
        attendeeCount: { $size: "$attendees" },
        category: "$category"
      }
    },
    {
      $group: {
        _id: "$category",
        totalParticipants: { $sum: "$attendeeCount" },
        events: { $sum: 1 }
      }
    },
    { $sort: { totalParticipants: -1 } }
  ]);

  return {
    totals: {
      users,
      clubs,
      events,
      teams
    },
    participation,
    recentEvents
  };
};

const getClubAnalytics = async (clubId) => {
  const events = await Event.find({ club: clubId }).lean();
  const totalParticipants = events.reduce((acc, event) => acc + (event.attendees?.length || 0), 0);

  return {
    totalEvents: events.length,
    totalParticipants,
    averageParticipation: events.length ? Math.round(totalParticipants / events.length) : 0,
    events: events.map((event) => ({
      id: event._id,
      title: event.title,
      date: event.date,
      attendeeCount: event.attendees?.length || 0
    }))
  };
};

module.exports = { getPlatformAnalytics, getClubAnalytics };