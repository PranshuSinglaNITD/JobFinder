//debugging completed via pritnting at every step

import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import Job from "@/models/Job";
import User from "@/models/User";

//  It ensures a page or route is rendered on every request rather than at build time.
export const dynamic = "force-dynamic";

export async function GET(req, {params}) {
    try {
        await connectDb();
        const { id: jobId } = await params;
        const job = await Job.findById(jobId);
        
        if (!job) {
            return NextResponse.json({ 'message': 'job not found' }, { status: 404 });
        }
        
        // 1. Fetch from MongoDB (Slightly relaxed for testing)
        const potentialCandidates = await User.find({
            role: 'candidate', 
            // Temporarily commented out to ensure we catch AT LEAST ONE user for testing
            // isSearchable: true, 
            // resumeText: { $exists: true, $ne: '' }
        }).limit(5);
        
        console.log(`[STEP 1] MongoDB found ${potentialCandidates.length} candidates!`);
        
        if (potentialCandidates.length === 0) {
            return NextResponse.json({ suggestions: [] }, { status: 200 });
        }
        
        const candidatePython = potentialCandidates.map(c => ({
            id: c._id.toString(),
            name: `${c.firstName} ${c.lastName}`,
            resumeText: c.resumeText || "Software Engineer with Python and React skills." // Fallback fake text if empty
        }));
        
        console.log(`[STEP 2] Sending ${candidatePython.length} candidate(s) to Python AI...`);

        // 2. Safely connect to the Cloud Python Server (Not Localhost!)
        // It uses your environment variable, or falls back to your specific Render URL
        const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "https://jobfinder-d8xk.onrender.com";
        
        const pythonRes = await fetch(`${pythonApiUrl}/api/rank-candidates`, {
            method: "POST",
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                job_description: `${job.title} - ${job.description} - Skills: ${job.skills}`,
                candidates: candidatePython
            })
        });
        
        if (!pythonRes.ok) {
            const errorText = await pythonRes.text();
            console.error("[ERROR] Python Server Rejected the Request:", errorText);
            throw new Error(`Python Ranking Failed: ${errorText}`);
        }
        
        const aiData = await pythonRes.json();
        console.log(`[STEP 3] Python successfully returned ${aiData.suggestions?.length || 0} ranked candidates!`);

        return NextResponse.json({ suggestions: aiData.suggestions }, { status: 200 });
    }
    catch (error) {
        console.error("[FATAL ERROR] API Crashed:", error);
        return NextResponse.json({ 'error': error.message || error }, { status: 501 });
    }
}