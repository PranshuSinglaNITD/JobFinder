
import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDb();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (user) {
      // User exists! Send back their data (hide password)
      const userData = user.toObject();
      delete userData.password;
      return NextResponse.json({ exists: true, user: userData }, { status: 200 });
    } else {
      // User does not exist yet
      return NextResponse.json({ exists: false }, { status: 200 });
    }
  } catch (error) {
    console.error("Check User Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}