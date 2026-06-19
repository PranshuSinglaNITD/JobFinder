import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDb from "@/middleware/mongoose";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  ],
  callbacks: {
    // 1. THIS RUNS FIRST WHEN THEY CLICK "LOGIN WITH GOOGLE"
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          await connectDb();
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Safely split the Google name for your database schema
            const nameParts = user.name ? user.name.split(" ") : ["User"];
            const fName = nameParts[0];
            const lName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

            await User.create({
              firstName: fName,
              lastName: lName,
              email: user.email,
              picturePath: user.image,
              password: `google-auth-login-${Math.random().toString(36).slice(-8)}`,
              role: "candidate",
            });
          }
          
          return true; // Tells NextAuth "Let them in!"
          
        } catch (error) {
          // If ANYTHING fails above, it prints here and denies access
          console.error("🚨 CRASH INSIDE SIGN IN:", error);
          return false; 
        }
      }
      return true;
    },

    // 2. THIS RUNS SECOND TO ATTACH DB INFO TO THEIR SESSION COOKIE
    async session({ session }) {
      try {
        await connectDb();
        const dbUser = await User.findOne({ email: session.user?.email });
        
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.role = dbUser.role;
          session.user.companyName = dbUser.company?.name;
        }
      } catch (error) {
        console.error("Session database error:", error);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };