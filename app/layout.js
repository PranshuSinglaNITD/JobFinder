import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "./AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "JobFinder",
  description: "Find your dream job and predict your salary.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Navbar /> 
        {children}
        <Footer/>
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}