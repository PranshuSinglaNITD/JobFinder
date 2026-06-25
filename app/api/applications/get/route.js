import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import Application from "@/models/Application";
import Job from "@/models/Job"; 

export async function GET(req) {
    try {
        await connectDb();
        const url = new URL(req.url);
        const userId = url.searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ success: false, message: "Missing User ID" }, { status: 400 });
        }

        const applications = await Application.find({ applicantId: userId })
            .populate({
                path: "jobId",
                select: "title company location workMode jobType salary isActive expiresAt"
            })
            .sort({ createdAt: -1 }); 

        return NextResponse.json({ success: true, data: applications }, { status: 200 });

    } catch (error) {
        console.error("Fetch My Applications Error:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}