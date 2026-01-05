import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose"
import Job from "@/models/Job";

export async function POST(req) {
  try {
    await connectDb();

    // 1. Get data from the frontend request
    const body = await req.json();
    
    // Destructure to ensure we have required fields
    const { title, company, location, category, salary, description, postedBy } = body;

    // 2. Basic Validation
    if (!title || !company || !postedBy) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // 3. Create the Job in MongoDB
    const newJob = await Job.create({
      title,
      company,
      location,
      category,
      salary,
      description,
      postedBy, // This should be the ID of the logged-in Recruiter
    });

    return NextResponse.json(
      { success: true, message: "Job posted successfully!", data: newJob },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { success: false, message: "Server error, please try again." },
      { status: 500 }
    );
  }
}