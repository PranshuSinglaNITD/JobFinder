import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import Chat from "@/models/Chat";

export async function GET(req, { params }) {
  try {
    await connectDb();
    
    // Await params in Next.js App Router
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "Chat ID is required" }, { status: 400 });
    }

    // Fetch the specific chat session from MongoDB
    const chat = await Chat.findById(id);

    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    // Return the messages AND the original resume text used for this session
    return NextResponse.json({ 
      success: true, 
      messages: chat.messages,
      resumeText: chat.resumeText 
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching specific chat:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}