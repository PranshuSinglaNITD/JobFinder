import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import User from "@/models/User";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    await connectDb();
    
    // 1. Grab the file and userId from the frontend form data
    const formData = await req.formData();
    
    // Safely look for either "file" or "resume" depending on how the frontend names it
    const file = formData.get("file") || formData.get("resume"); 
    const userId = formData.get("userId");

    if (!file || !userId) {
      return NextResponse.json({ message: "File and userId are required." }, { status: 400 });
    }

    // --- 2. SAVE THE FILE LOCALLY (To get a URL) ---
    // Convert the file into a Node.js Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a safe, unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`;
    
    // Save it to the public/uploads folder so it can be accessed via URL
    const uploadDir = path.join(process.cwd(), "public/uploads");
    try {
        await mkdir(uploadDir, { recursive: true }); // Ensure the folder exists
    } catch (e) {
        // Folder already exists, ignore
    }
    
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // This is the URL that the frontend and recruiters will use to view the PDF
    const resumeUrl = `/uploads/${filename}`;
    const resumeName = file.name;


    // --- 3. FORWARD TO PYTHON (For AI Vectorization) ---
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


    // --- 4. SAVE EVERYTHING TO MONGODB ---
    // We save the URL for humans, and the Text for the AI!
    const updatedUser = await User.findByIdAndUpdate(
        userId, 
        { 
            resumeUrl: resumeUrl,
            resumeName: resumeName,
            resumeText: text,
            isSearchable: true 
        },
        { new: true } // Returns the newly updated document
    );

    return NextResponse.json({ 
        success: true, 
        message: "Master Resume uploaded and parsed successfully!",
        resumeUrl: updatedUser.resumeUrl,
        resumeName: updatedUser.resumeName
    }, { status: 200 });

  } catch (error) {
    console.error("Resume Upload Error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}