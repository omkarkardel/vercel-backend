const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { ROLE } = require("../utils/roles");

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback"
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error("Google account does not provide email"));
          }

          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              name: profile.displayName || "Campus User",
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              role: ROLE.STUDENT
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
