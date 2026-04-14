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
      // required: true,
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
    
    company: {
      name: { type: String, default: "" },
      website: { type: String, default: "" },
      description: { type: String, default: "" },
    },

    location: { type: String, default: "" },
    occupation: { type: String, default: "" },
    viewedProfile: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    
    socialLinks: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },
    skills: { type: Array, default: [] },
    resumeText: { type: String, default: "" }, 
    isSearchable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

//this allows mongodb to search through 1000 of resumes in ms 
//could be asked in interview HOW??
userSchema.index({ skills: 'text', resumeText: 'text', occupation: 'text' });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;