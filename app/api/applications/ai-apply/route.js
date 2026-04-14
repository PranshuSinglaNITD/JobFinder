import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
// Make sure this path matches wherever your Application schema is!
import Application from "@/models/Application"; 

export async function POST(req) {
    try {
        await connectDb();
        const { jobId, userId, coverLetter } = await req.json();

        // Save the AI's application to your MongoDB
        const newApp = new Application({
            jobId,
            applicantId: userId, // Match this to whatever your schema calls the user ID
            coverLetter,
            status: "Applied",
            appliedAt: new Date()
        });

        await newApp.save();

        return NextResponse.json({ success: true, message: "Application saved!" }, { status: 200 });
        
    } catch (error) {
        console.error("AI Apply Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}