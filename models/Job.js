import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    company: {
      name: { type: String, required: true },
      logo: { type: String, default: "" }, // URL to logo
      website: String,
    },
    location: { type: String, required: true }, // e.g. "Remote", "New York, USA"
    workMode: { 
      type: String, 
      enum: ["Remote", "On-site", "Hybrid"], 
      default: "On-site" 
    },
    jobType: { 
      type: String, 
      enum: ["Full-time", "Part-time", "Contract", "Internship"], 
      default: "Full-time" 
    },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: "USD" },
    },
    description: { type: String, required: true },
    requirements: [String], // Array of skills/requirements
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track who applied
    status: { type: String, enum: ["Active", "Closed"], default: "Active" },
    aiSuggestions: { type: Array, default: [] },
    expiresAt: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    }
  },
  { timestamps: true }
);

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema,"jobs");

export default Job;