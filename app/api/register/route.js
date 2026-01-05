import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectDb from "@/middleware/mongoose";

export async function POST(req) {
  try {
    await connectDb();

    const {  
      name, 
      email, 
      password, 
      role, 
      companyName, 
      companyWebsite 
    } = await req.json();

    // 1. Validation: Check missing fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All required fields must be filled." },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email." },
        { status: 409 }
      );
    }

    // 3. Hash the Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Split Name (e.g., "John Doe" -> "John", "Doe")
    // If user enters "John", lastName will be empty string
    const nameParts = name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    // 5. Create User Object
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash, // Save the HASH, not the real password
      role: role || "candidate",
      picturePath: "", // Default empty or set a placeholder URL
      location: "",
      occupation: "",
      viewedProfile: 0,
      impressions: 0,
      // Only add company details if role is recruiter
      company: role === "recruiter" ? {
        name: companyName || "",
        website: companyWebsite || ""
      } : undefined
    });

    // 6. Save to MongoDB
    const savedUser = await newUser.save();

    // 7. Remove password from response for security
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { success: true, message: "User registered successfully.", user: userResponse },
      { status: 201 }
    );

  } catch (err) {
    console.error("Registration Error:", err);
    return NextResponse.json(
      { message: "Registration failed.", error: err.message },
      { status: 500 }
    );
  }
}