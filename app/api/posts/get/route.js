import { NextResponse } from "next/server";
import Post from "@/models/Post";
import User from "@/models/User"; // Import User to ensure Schema is registered
import connectDb from "@/middleware/mongoose";

export const dynamic = "force-dynamic"; // Important: Prevent static caching

export async function GET(req) {
  try {
    await connectDb();

    // 1. Extract 'userId' from the URL query params
    // Example URL: /api/posts/get?userId=65a123...
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // 2. Build the Query Object
    let query = {};
    
    if (userId) {
      // If a userId is provided, fetch ONLY posts by that author
      query = { author: userId };
    } 
    // If no userId is provided, 'query' stays empty {}, which finds ALL posts

    // 3. Fetch from Database
    const posts = await Post.find(query)
      .populate("author") // Fill in the author details (name, picture)
      .sort({ createdAt: -1 }); // Sort newest first

    return NextResponse.json(posts, { status: 200 });

  } catch (err) {
    console.error("Get Posts Error:", err);
    return NextResponse.json({ message: "Server Error", error: err.message }, { status: 500 });
  }
}