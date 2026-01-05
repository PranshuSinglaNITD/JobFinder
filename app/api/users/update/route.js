import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDb from "@/middleware/mongoose";

export async function PUT(req) {
  try {
    await connectDb();
    const body = await req.json();
    const { userId, firstName, lastName, location, occupation, company, picturePath } = body;

    // Security: Ensure userId is provided
    if (!userId) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 });
    }

    // Build update object
    const updateData = {
      firstName,
      lastName,
      location,
      occupation,
      picturePath, // In a real app, this is a URL from cloud storage (AWS S3/Cloudinary)
      // Only update company if provided (merge with existing)
      ...(company && { company }) 
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    ).select("-password"); // Return user without password

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ message: "Update failed", error: error.message }, { status: 500 });
  }
}