import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import Job from "@/models/Job";

export async function GET(req) {
    try {
        // Security: Make sure only your Cron service can trigger this!
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDb();
        
        const now = new Date();
        const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now

        // Find all jobs that expire between right now and tomorrow, and are still active
        const expiringJobs = await Job.find({
            isActive: true,
            expiresAt: { $gt: now, $lte: tomorrow }
        }).populate("recruiterId");

        // Loop through them and send notifications
        for (const job of expiringJobs) {
            // Re-use the notification system you already built!
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notification/trigger`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: job.recruiterId._id,
                    type: 'JOB_EXPIRING',
                    content: `⚠️ Urgent: Your job posting "${job.title}" is closing in less than 24 hours!`
                })
            });
        }

        return NextResponse.json({ success: true, notified: expiringJobs.length });
    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}