const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLE } = require("../utils/roles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      minlength: 6
    },
    googleId: {
      type: String,
      default: null
    },
    avatar: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.STUDENT
    },
    interests: {
      type: [String],
      default: []
    },
    skills: {
      type: [String],
      default: []
    },
    joinedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
      }
    ],
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
