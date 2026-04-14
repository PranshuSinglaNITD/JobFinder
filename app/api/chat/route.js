import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import Job from "@/models/Job";
import Chat from "@/models/Chat";

export async function POST(req) {
  try {
    await connectDb();
    
    // 1. Receive the perfect data from your React frontend
    const { chatId, userId, userName, message, resumeText } = await req.json();

    if (!message || !userId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 2. Fetch Active Jobs Context
    const jobs = await Job.find({ status: "Active" }).select("title companyName location salary workMode jobType requirements");
    const jobContext = jobs.map((job, index) => {
      const skills = Array.isArray(job.requirements) ? job.requirements.join(", ") : job.requirements;
      return `[ID: ${job._id}] Role: ${job.title} at ${job.companyName || "Confidential"} | Pay: ₹${job.salary?.min}-₹${job.salary?.max} | Skills: ${skills}`;
    }).join("\n");

    // 3. Load or Create MongoDB Chat History (Keeping your database intact!)
    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
    } else {
      chat = new Chat({ 
          userId, 
          title: message.substring(0, 30) + "...", 
          resumeText: resumeText || "",
          messages: [] 
      });
    }

    // 4. Save User's Message to MongoDB
    chat.messages.push({ role: "user", content: message });
    await chat.save(); // We must save here so a brand new chat gets an _id !

    // 5. Send payload to Python LangGraph
    const pythonResponse = await fetch("http://localhost:8000/api/jobbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chat._id.toString(), // 🚨 LangGraph uses this exact ID to remember the chat!
            message: message,
            user_name: userName,
            user_id:userId,
            resume_text: chat.resumeText,
            jobs_context: jobContext
            // 🚨 Look: No history array sent! LangGraph already knows.
        })
    });

    if (!pythonResponse.ok){
      const error=await pythonResponse.text()
      console.error(error)
      throw new Error("Python Server Failed");}
    const aiData = await pythonResponse.json();

    // 🚨 THE FIX: Extract the string if Python returns a LangChain Array
    let finalReply = aiData.reply;
    
    // Check if Gemini/LangChain returned an array of content blocks
    if (Array.isArray(finalReply)) {
        // Find the block that contains the actual text
        const textBlock = finalReply.find(block => block.type === 'text' || block.text);
        finalReply = textBlock ? textBlock.text : "I processed that, but couldn't format the text.";
    } else if (typeof finalReply === 'object') {
        // Just in case it returns a weird object
        finalReply = JSON.stringify(finalReply);
    }

    // 6. Save AI's Response to MongoDB
    chat.messages.push({ role: "model", content: finalReply });
    await chat.save();

    // 7. Return the response back to your React frontend
    return NextResponse.json({ 
        reply: finalReply, // Send the cleaned string to the frontend too!
        chatId: chat._id 
    }, { status: 200 });

  } catch (error) {
    console.error("JobBot API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}