// app/api/login/route.js
import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDb from "@/middleware/mongoose";

export async function POST(req) {
  try {
    await connectDb();
    
    const { email, password } = await req.json();

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 2. Check Password
    // If you haven't hashed passwords yet, use: if (user.password !== password)
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Payload
      process.env.JWT_SECRET,            // Secret Key
      { expiresIn: "7d" }                // Expiration
    );

    // 4. Return Token and User Data (excluding password)
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      picturePath: user.picturePath,
      company:user.company
    };

    return NextResponse.json({ token, user: userData }, { status: 200 });

  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Login failed", error: err.message }, { status: 500 });
  }
}