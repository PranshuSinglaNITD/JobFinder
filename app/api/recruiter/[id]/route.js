import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import User from "@/models/User";
import Job from "@/models/Job"; 

export async function GET(req, { params }) {
    try {
        await connectDb();
        const { id } = await params;

        // 🚨 ADD THIS CONSOLE.LOG HERE 🚨
        console.log("👉 SEARCHING FOR RECRUITER ID:", id);

        const recruiter = await User.findById(id).select("-password -email");

        // 🚨 AND ADD THIS ONE 🚨
        console.log("👉 DATABASE RESULT:", recruiter);

        if (!recruiter) {
             return NextResponse.json({ success: false, message: "Recruiter not found" }, { status: 404 });
        }

        const postedJobs = await Job.find({ recruiterId: id, status: "Active" }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, recruiter, jobs: postedJobs });

    } catch (error) {
        console.error("Error fetching recruiter profile:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}