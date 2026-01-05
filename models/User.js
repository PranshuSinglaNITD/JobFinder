import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    picturePath: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["candidate", "recruiter"],
      default: "candidate",
    },
    // Company details (specifically for recruiters)
    company: {
      name: { type: String, default: "" },
      website: { type: String, default: "" },
      description: { type: String, default: "" },
    },
    // Additional profile fields
    location: { type: String, default: "" },
    occupation: { type: String, default: "" },
    viewedProfile: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    
    // You can keep a separate profile object for deeper details if you want,
    // but ensure your update logic handles it.
    skills: { type: Array, default: [] },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;