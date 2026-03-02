import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    // The user who receives the notification
    recipient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    // Optional: The user/recruiter who triggered it
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    // Categorize notifications for different icons/colors on the frontend
    type: { 
      type: String, 
      enum: ["APPLICATION_UPDATE", "PROFILE_VIEW", "INTERVIEW_INVITE", "SYSTEM"], 
      required: true 
    },
    // The actual text (e.g., "Google viewed your application!")
    content: { 
      type: String, 
      required: true 
    },
    // Where to redirect when the user clicks the notification
    link: { 
      type: String 
    },
    // To show the unread "red dot" badge
    isRead: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Prevent Next.js from recompiling the model multiple times
export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);