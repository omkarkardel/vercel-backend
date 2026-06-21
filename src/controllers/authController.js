const passport = require("passport");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const apiResponse = require("../utils/apiResponse");
const { createToken } = require("../services/tokenService");
const { ROLE } = require("../utils/roles");

const ADMIN_EMAIL = "omkarkardel175@gmail.com";
const ADMIN_PASSWORD = "123456";
const ADMIN_NAME = "CampusHub Admin";

const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, interests = [], skills = [] } = req.body;

  if (!name || !email || !password) {
    return next(new ApiError(400, "Name, email and password are required"));
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === ADMIN_EMAIL) {
    return next(new ApiError(403, "This email is reserved for admin access"));
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    return next(new ApiError(409, "Email is already registered"));
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: ROLE.STUDENT,
    interests,
    skills
  });

  const token = createToken(user);

  return res.status(201).json(
    apiResponse(
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          interests: user.interests,
          skills: user.skills
        }
      },
      "Signup successful"
    )
  );
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Email and password are required"));
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (!adminUser) {
      adminUser = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: ROLE.SUPER_ADMIN
      });
    } else {
      let shouldSave = false;

      if (adminUser.role !== ROLE.SUPER_ADMIN) {
        adminUser.role = ROLE.SUPER_ADMIN;
        shouldSave = true;
      }

      if (!adminUser.password) {
        adminUser.password = ADMIN_PASSWORD;
        shouldSave = true;
      }

      if (shouldSave) {
        await adminUser.save();
      }
    }

    const token = createToken(adminUser);

    return res.json(
      apiResponse(
        {
          token,
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            interests: adminUser.interests,
            skills: adminUser.skills,
            club: adminUser.club
          }
        },
        "Login successful"
      )
    );
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return next(new ApiError(401, "Invalid credentials"));
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return next(new ApiError(401, "Invalid credentials"));
  }

  const token = createToken(user);

  return res.json(
    apiResponse(
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          interests: user.interests,
          skills: user.skills,
          club: user.club
        }
      },
      "Login successful"
    )
  );
});

const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false
});

const googleCallback = [
  passport.authenticate("google", { session: false, failureRedirect: "/api/v1/auth/google/failure" }),
  (req, res) => {
    const token = createToken(req.user);
    const frontendSuccess = process.env.GOOGLE_SUCCESS_REDIRECT || "http://localhost:5173/oauth-success";
    res.redirect(`${frontendSuccess}?token=${token}`);
  }
];

const googleFailure = (_req, res) => {
  res.status(401).json({ success: false, message: "Google authentication failed" });
};

const requireGoogleOAuthConfig = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: "Google OAuth is not configured on this server"
    });
  }

  return next();
};

module.exports = {
  signup,
  login,
  requireGoogleOAuthConfig,
  googleAuth,
  googleCallback,
  googleFailure
};
