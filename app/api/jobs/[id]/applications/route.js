import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose"; // Or "@/lib/mongoose" depending on your folder structure
import Application from "@/models/Application";
import User from "@/models/User"; // Needed for population

export async function GET(req, { params }) {
    try {
        await connectDb();
        const { id } = await params;

        // Fetch all applications tied to this specific Job ID, and populate candidate details
        const applications = await Application.find({ jobId: id })
            .populate({
                path: "applicantId",
                select: "firstName lastName email occupation location picturePath"
            })
            .sort({ createdAt: -1 }); // Newest first

        return NextResponse.json({ success: true, data: applications }, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch job applications:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}