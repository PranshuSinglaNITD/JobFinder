import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import Job from "@/models/Job";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDb();

    // Now populate will work because "User" is registered
    const jobs = await Job.find({}).populate("recruiterId", "firstName lastName email picturePath company").sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, count: jobs.length, data: jobs },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}