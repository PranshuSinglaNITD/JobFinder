import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import Notification from "@/models/Notification";
import { pusherServer } from "@/middleware/pusherServer";

export async function POST(req) {
  try {
    await connectDb();
    
    const { recipientId, senderId, type, content, link } = await req.json();

    if (!recipientId || !content) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 2. Save it to MongoDB (Persistent Storage)
    const newNotification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      content,
      link,
    });
    const channelName = `user-${recipientId}`;
    
    await pusherServer.trigger(channelName, "new-notification", {
      notification: newNotification 
    });

    return NextResponse.json({ success: true, notification: newNotification }, { status: 201 });

  } catch (error) {
    console.error("Notification Trigger Error:", error);
    return NextResponse.json({ message: "Failed to send notification" }, { status: 500 });
  }
}