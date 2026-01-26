import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDb from "@/middleware/mongoose";

export async function POST(req) {
  try {
    await connectDb();
    const { name, email, image, role, companyName, companyWebsite } = await req.json();

    if (!email) return NextResponse.json({ message: "Invalid Data" }, { status: 400 });

    let user = await User.findOne({ email });

    if (!user) {
      const nameParts = name ? name.split(" ") : ["User"];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      user = new User({
        firstName,
        lastName,
        email,
        
        // --- THE FIX IS HERE ---
        // Instead of "", we give a long random string.
        // This satisfies "required: true" in your Schema.
        password: "google-auth-login-" + Math.random().toString(36).slice(2), 
        
        role: role || "candidate",
        picturePath: image || "",
        provider: "google",
        company: role === "recruiter" ? {
            name: companyName || "",
            website: companyWebsite || ""
        } : undefined
      });

      await user.save();
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({ success: true, user: userResponse }, { status: 200 });

  } catch (err) {
    console.error("Google Sync Error:", err);
    return NextResponse.json({ message: "Sync failed.", error: err.message }, { status: 500 });
  }
}