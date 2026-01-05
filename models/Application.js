import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Reviewing", "Shortlisted", "Rejected"],
      default: "Applied",
    },
    resumeName: { type: String }, 
    resumeFileType: { type: String }, // <--- ADD THIS (e.g., 'application/pdf')
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);

export default Application;