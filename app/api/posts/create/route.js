import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import Post from "@/models/Post"; // Ensure this matches your Post model path
import connectDb from "@/middleware/mongoose";

export async function POST(req) {
  try {
    await connectDb();

    // 1. Parse the incoming form data
    const formData = await req.formData();

    // 2. Get the fields (Must match what you append in Frontend)
    const userId = formData.get("userId");
    const content = formData.get("description");
    const file = formData.get("media"); // Make sure Frontend appends to "media"

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    let mediaData = null;

    // 3. Handle File Upload (Only if file exists)
    if (file && file.name) {
      // Convert file to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const filename = Date.now() + "_" + file.name.replace(/\s/g, "_");
      
      // Define path: public/uploads (Visible to browser)
      // Note: Create a folder named 'uploads' inside your 'public' folder manually first!
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, filename);

      // Save file to filesystem
      await writeFile(filePath, buffer);

      // Construct media object for DB (URL is relative to public folder)
      mediaData = {
        url: `/uploads/${filename}`, // This URL is used to display the image
        fileType: file.type,
        name: file.name,
      };
    }

    // 4. Create Post in Database
    const newPost = new Post({
      author: userId, // Maps explicitly to your Schema's 'author'
      content: content,
      media: mediaData || {}, // If no file, pass empty object or null
      likes: [],
    });

    await newPost.save();

    return NextResponse.json(
      { message: "Post created successfully", post: newPost },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create Post Error:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}