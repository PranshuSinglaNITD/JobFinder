import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDb();
    
    // 1. Grab the file and userId from the frontend form data
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");

    if (!file || !userId) {
      return NextResponse.json({ message: "File and userId are required." }, { status: 400 });
    }

    // 2. Forward the file to the Python Text Extractor
    const pythonFormData = new FormData();
    pythonFormData.append("file", file);

    const PYTHON_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";
    const pyRes = await fetch(`${PYTHON_URL}/api/extract-text`, {
      method: "POST",
      body: pythonFormData,
    });

    if (!pyRes.ok) {
        const errorText = await pyRes.text();
        console.error("Python Extraction Failed:", errorText);
        throw new Error("Python server could not extract text.");
    }

    const { text } = await pyRes.json();

    // 3. Save the extracted text to the User's database profile
    await User.findByIdAndUpdate(userId, { 
        resumeText: text,
        isSearchable: true // Ensure they are now visible to recruiters
    });

    return NextResponse.json({ success: true, message: "Resume uploaded and parsed successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Resume Upload Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}