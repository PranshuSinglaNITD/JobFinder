import { NextResponse } from "next/server";
import Job from "@/models/Job";
// Note: If you renamed 'middleware' to 'lib' earlier to fix the proxy issue, 
// make sure this path matches your folder structure!
import connectDb from "@/middleware/mongoose"; 

export async function POST(req) {
  try {
    await connectDb();

    const body = await req.json();
  
    const { 
      recruiterId, title, companyName, companyLogo, 
      location, workMode, jobType, salaryMin, salaryMax, 
      description, requirements, expiresAt 
    } = body;

    if (!recruiterId || !title || !companyName || !description) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    let parsedRequirements = [];
    if (Array.isArray(requirements)) {
        parsedRequirements = requirements;
    } else if (typeof requirements === 'string') {
        parsedRequirements = requirements.split(',').map(req => req.trim()).filter(Boolean);
    }

    //Handle Expiration Date (With a 30-day safety fallback)
    let finalExpiresAt;
    if (expiresAt) {
        finalExpiresAt = new Date(expiresAt);
    } else {
        finalExpiresAt = new Date();
        finalExpiresAt.setDate(finalExpiresAt.getDate() + 30); // Default to 30 days
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
      requirements: parsedRequirements, // Uses the safely parsed array
      expiresAt: finalExpiresAt,        // Saves the expiration deadline
      isActive: true                    // Explicitly mark as active upon creation
    });

    await newJob.save();

    return NextResponse.json({ message: "Job posted successfully", job: newJob }, { status: 201 });

  } catch (error) {
    console.error("Create Job Error:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}