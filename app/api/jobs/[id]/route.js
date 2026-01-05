import { NextResponse } from "next/server";
import Job from "@/models/Job";
import connectDb from "@/middleware/mongoose";

// 1. DELETE A JOB
export async function DELETE(req, { params }) {
  try {
    await connectDb();
    const { id } = await params;

    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}

// 2. GET SINGLE JOB (For the Edit Page)
export async function GET(req, { params }) {
  try {
    await connectDb();
    const { id } =await  params;

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: job }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

// 3. UPDATE JOB
export async function PUT(req, { params }) {
  try {
    await connectDb();
    const { id } = await params;
    
    // Get the flat data from frontend
    const body = await req.json();

    // 🛠️ RESTRUCTURE DATA FOR MONGODB 🛠️
    // We explicitly map salaryMin/Max to the salary object
    const updateData = {
      title: body.title,
      companyName: body.companyName,
      location: body.location,
      workMode: body.workMode,
      jobType: body.jobType,
      description: body.description,
      requirements: body.requirements,
      
      // 👇 THIS WAS THE MISSING PART
      salary: {
        min: body.salaryMin,
        max: body.salaryMax
      }
    };

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedJob) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Job Updated", data: updatedJob }, { status: 200 });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}