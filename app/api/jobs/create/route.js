import { NextResponse } from "next/server";
import Job from "@/models/Job";
import connectDb from "@/middleware/mongoose";

export async function POST(req) {
  try {
    await connectDb();

    const body = await req.json();
    
    // Destructure all fields
    const { 
      recruiterId, title, companyName, companyLogo, 
      location, workMode, jobType, salaryMin, salaryMax, 
      description, requirements 
    } = body;

    // Basic Validation
    if (!recruiterId || !title || !companyName || !description) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newJob = new Job({
      recruiterId,
      title,
      company: {
        name: companyName,
        logo: companyLogo || "",
      },
      location,
      workMode,
      jobType,
      salary: {
        min: Number(salaryMin) || 0,
        max: Number(salaryMax) || 0,
      },
      description,
      // Convert comma-separated string to array if needed
      requirements: Array.isArray(requirements) ? requirements : [],
    });

    await newJob.save();

    return NextResponse.json({ message: "Job posted successfully", job: newJob }, { status: 201 });

  } catch (error) {
    console.error("Create Job Error:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}