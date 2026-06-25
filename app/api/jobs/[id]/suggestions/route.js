import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import Job from "@/models/Job";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req, {params}) {
    try {
        await connectDb();
        const { id: jobId } = await params;
        const job = await Job.findById(jobId);
        
        if (!job) {
            return NextResponse.json({ message: 'job not found' }, { status: 404 });
        }
        
        // OPTIMIZATION: If we already have AI suggestions, skip the database lookup and return them instantly!
        if (job.aiSuggestions && job.aiSuggestions.length > 0) {
            return NextResponse.json({ suggestions: job.aiSuggestions }, { status: 200 });
        }
        
        // BUG FIX: Only grab users whose IDs are inside the job's applicants array!
        const potentialCandidates = await User.find({
            _id: { $in: job.applicants }, 
            role: 'candidate',
            resumeText: { $exists: true, $ne: '' }
        });

        // SAFETY NET: If no valid candidates applied, don't bother waking up AWS.
        if (potentialCandidates.length === 0) {
            return NextResponse.json({ suggestions: [] }, { status: 200 });
        }
        
        const candidatePython = potentialCandidates.map(c => ({
            id: c._id.toString(),
            name: `${c.firstName} ${c.lastName}`,
            resumeText: c.resumeText
        }));
        
        const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "https://jobfinder-d8xk.onrender.com";
        
        // Push payload to FastAPI (which routes to AWS SQS)
        const pythonRes = await fetch(`${pythonApiUrl}/api/rank-candidates`, {
            method: "POST",
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                job_id: job._id.toString(), 
                job_description: `${job.title} - ${job.description} - Skills: ${job.skills}`,
                candidates: candidatePython
            })
        });
        
        if (!pythonRes.ok) {
            const errorText = await pythonRes.text();
            throw new Error(`Python Ranking Failed: ${errorText}`);
        }
        
        const aiData = await pythonRes.json();

        // Return the {"status": "queued"} response directly to the frontend
        return NextResponse.json(aiData, { status: 200 });
    }
    catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message || error }, { status: 501 });
    }
}