import { NextResponse } from "next/server";
import Job from "@/models/Job";
import Application from "@/models/Application";
import User from "@/models/User"; // Ensure models are registered
import connectDb from "@/middleware/mongoose";

export async function GET(req) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const recruiterId = searchParams.get("recruiterId");

    if (!recruiterId) return NextResponse.json({ message: "ID Required" }, { status: 400 });

    // 1. Find all jobs posted by this recruiter
    const jobs = await Job.find({ recruiterId }).select("_id");
    const jobIds = jobs.map(job => job._id);

    // 2. Find applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate("applicantId", "firstName lastName email picturePath occupation location") // Get candidate details
      .populate("jobId", "title") // Get job title
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: applications }, { status: 200 });

  } catch (error) {
    console.error("Fetch Apps Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}