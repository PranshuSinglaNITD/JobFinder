import { NextResponse } from "next/server";
import Job from "@/models/Job";
import connectDb from "@/middleware/mongoose";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDb()

    const { searchParams } = new URL(req.url);
    
    // Extract Filters
    const recruiterId = searchParams.get("recruiterId");
    const keyword = searchParams.get("query");     // For search bar
    const location = searchParams.get("location"); // For location filter
    const jobType = searchParams.get("type");      // For Full-time/Part-time filter

    let dbQuery = { status: "Active" }; // Candidates only see Active jobs by default

    // --- SCENARIO 1: RECRUITER VIEW (My History) ---
    if (recruiterId) {
      // If recruiter asks, show ALL their jobs (even Closed ones)
      dbQuery = { recruiterId: recruiterId }; 
    } 
    
    // --- SCENARIO 2: CANDIDATE SEARCH ---
    else {
      // 1. Keyword Search (Matches Title OR Company Name)
      if (keyword) {
        dbQuery.$or = [
          { title: { $regex: keyword, $options: "i" } }, // 'i' = case insensitive
          { "company.name": { $regex: keyword, $options: "i" } }
        ];
      }

      // 2. Location Filter (Matches "Remote", "New York", etc.)
      if (location) {
        dbQuery.location = { $regex: location, $options: "i" };
      }

      // 3. Job Type Filter
      if (jobType) {
        dbQuery.jobType = jobType;
      }
    }

    // Execute Query
    const jobs = await Job.find(dbQuery).sort({ createdAt: -1 });

    return NextResponse.json(jobs, { status: 200 });

  } catch (error) {
    console.error("Get Jobs Error:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}