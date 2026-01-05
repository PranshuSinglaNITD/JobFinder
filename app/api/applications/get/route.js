import { NextResponse } from "next/server";
import Application from "@/models/Application";
import Job from "@/models/Job"; // Important to register the model
import connectDb from "@/middleware/mongoose";

export async function GET(req) {
  try {
    await connectDb();
    //destructuring
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 });
    }

    const applications = await Application.find({ applicantId: userId })
      .populate({
        path: "jobId",
        select: "title company location jobType", // Only get what we need
      })
      .sort({ createdAt: -1 }); // Newest first

    return NextResponse.json({ success: true, data: applications }, { status: 200 });

  } catch (error) {
    console.error("Fetch Apps Error:", error);
    return NextResponse.json({ message: "Error fetching applications", error: error.message }, { status: 500 });
  }
}