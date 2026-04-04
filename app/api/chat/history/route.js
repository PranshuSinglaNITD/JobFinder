import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import Chat from "@/models/Chat";

export async function GET(req) {
  try {
    await connectDb();
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) return NextResponse.json({ message: "UserId required" }, { status: 400 });

    // Fetch all chats for this user, sorted by newest first. Only select the ID and Title to save bandwidth.
    const chats = await Chat.find({ userId }).select("_id title").sort({ updatedAt: -1 });

    return NextResponse.json({ chats }, { status: 200 });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}