import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDb from "@/middleware/mongoose";
import Job from "@/models/Job";

export async function POST(req) {
  try {
    await connectDb();
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    // 1. Fetch Active Jobs
    const jobs = await Job.find({ status: "Active" })
      .select("title companyName location salary workMode jobType requirements description");

    if (!jobs || jobs.length === 0) {
        return NextResponse.json({ reply: "I'm currently checking our database, but it seems there are no active job listings available at the moment. Please check back later!" });
    }

    // 2. Build Context
    const jobContext = jobs.map((job, index) => {
      const skills = Array.isArray(job.requirements) ? job.requirements.join(", ") : job.requirements;
      return `
      [JOB #${index + 1}]
      - Role: ${job.title} at ${job.companyName || "Confidential"}
      - Location: ${job.location} (${job.workMode})
      - Pay: ₹${job.salary?.min} - ₹${job.salary?.max}
      - Type: ${job.jobType}
      - Key Skills: ${skills}
      - Details: ${job.description ? job.description.substring(0, 200) + "..." : "See listing"}
      `;
    }).join("\n");

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. The "Mega Prompt"
    const systemInstruction = `
      You are 'JobBot', an elite AI Recruitment Specialist for the JobFinder platform. 
      Your goal is to match candidates with their dream jobs from the list below.

      === MISSION ===
      Analyze the user's query and the 'AVAILABLE JOBS DATA'.
      Find the best matches based on skills, salary, location, and role type.

      === RULES ===
      1. **Strict Data Adherence:** ONLY recommend jobs listed in the "AVAILABLE JOBS DATA". Do not hallucinate jobs.
      2. **No Match Protocol:** If no job fits the user's request perfectly, suggest the *closest* match or advise them on what skills they might need.
      3. **Response Style:** - Be professional, encouraging, and concise.
         - Use Bullet points for job listings.
         - **Bold** key details like Salary and Company Name.
      4. **Salary Analysis:** If asked for "high paying jobs", rank them by the max salary figure.

      === AVAILABLE JOBS DATA ===
      ${jobContext}
      ===========================

      User Query: "${message}"
      
      Respond directly to the user:
    `;

    const result = await model.generateContent(systemInstruction);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ reply: text }, { status: 200 });

  } catch (error) {
    console.error("Chatbot Error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}