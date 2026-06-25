import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import Job from "@/models/Job";
import Chat from "@/models/Chat";

export async function POST(req) {
  try {
    await connectDb();
    const PYTHON_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";
    
    // 1. Receive data from React frontend
    const { chatId, userId, userName, message, resumeText } = await req.json();

    if (!message || !userId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 2. FIXED: Use `isActive: true` to match your Job schema!
    const jobs = await Job.find({ isActive: true }).select("title companyName location salary workMode jobType requirements");
    const jobContext = jobs.map((job) => {
      const skills = Array.isArray(job.requirements) ? job.requirements.join(", ") : job.requirements;
      return `[ID: ${job._id}] Role: ${job.title} at ${job.companyName?.name || "Confidential"} | Pay: ₹${job.salary?.min}-₹${job.salary?.max} | Skills: ${skills}`;
    }).join("\n");

    // 3. Load or Create MongoDB Chat History
    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
      // FIXED: If the frontend sends a fresh resume, update the chat's stored memory!
      if (resumeText && resumeText !== chat.resumeText) {
          chat.resumeText = resumeText;
      }
    } else {
      chat = new Chat({ 
          userId, 
          title: message.substring(0, 30) + "...", 
          resumeText: resumeText || "",
          messages: [] 
      });
    }

    // 4. Save User's Message 
    chat.messages.push({ role: "user", content: message });
    await chat.save(); 

    // 5. Send payload to Python LangGraph
    const pythonResponse = await fetch(`${PYTHON_URL}/api/jobbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chat._id.toString(), 
            message: message,
            user_name: userName,
            user_id: userId,
            resume_text: chat.resumeText, // Now guaranteed to be the freshest version!
            jobs_context: jobContext
        })
    });

    if (!pythonResponse.ok){
      const error = await pythonResponse.text();
      console.error("Python Error:", error);
      throw new Error("Python Server Failed");
    }
    
    const aiData = await pythonResponse.json();

    // 6. Clean the LangChain Response
    let finalReply = aiData.reply;
    if (Array.isArray(finalReply)) {
        const textBlock = finalReply.find(block => block.type === 'text' || block.text);
        finalReply = textBlock ? textBlock.text : "I processed that, but couldn't format the text.";
    } else if (typeof finalReply === 'object') {
        finalReply = JSON.stringify(finalReply);
    }

    // 7. Save AI's Response 
    chat.messages.push({ role: "model", content: finalReply });
    await chat.save();

    // 8. Return to React
    return NextResponse.json({ 
        reply: finalReply, 
        chatId: chat._id 
    }, { status: 200 });

  } catch (error) {
    console.error("JobBot API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}