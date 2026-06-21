const Event = require("../models/Event");
const Team = require("../models/Team");
const User = require("../models/User");

const getEventRecommendations = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) return [];

  const interests = (user.interests || []).map((item) => item.toLowerCase());
  const events = await Event.find({ date: { $gte: new Date() } }).populate("club", "name tags").lean();

  return events
    .map((event) => {
      const bucket = [
        event.category?.toLowerCase(),
        ...(event.club?.tags || []).map((tag) => tag.toLowerCase()),
        event.title?.toLowerCase(),
        event.description?.toLowerCase()
      ].filter(Boolean);

      const score = interests.reduce(
        (acc, interest) => (bucket.some((item) => item.includes(interest)) ? acc + 1 : acc),
        0
      );

      return { ...event, score };
    })
    .sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date))
    .slice(0, 6);
};

const suggestTeammates = async (userId, eventId) => {
  const user = await User.findById(userId).lean();
  if (!user) return [];

  const userSkills = (user.skills || []).map((skill) => skill.toLowerCase());
  const teams = await Team.find({ event: eventId }).populate("members.user", "name skills email").lean();

  const suggestions = [];

  for (const team of teams) {
    for (const member of team.members) {
      if (!member?.user || String(member.user._id) === String(userId)) continue;

      const memberSkills = (member.user.skills || []).map((skill) => skill.toLowerCase());
      const overlap = memberSkills.filter((skill) => userSkills.includes(skill));

      if (overlap.length > 0) {
        suggestions.push({
          teamId: team._id,
          teamName: team.name,
          userId: member.user._id,
          name: member.user.name,
          email: member.user.email,
          matchingSkills: overlap
        });
      }
    }
  }

  return suggestions.slice(0, 8);
};

module.exports = { getEventRecommendations, suggestTeammates };