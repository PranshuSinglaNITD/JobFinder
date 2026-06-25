import { NextResponse } from "next/server";
import connectDb from "@/middleware/mongoose";
import Application from "@/models/Application";
import Job from "@/models/Job";
import User from "@/models/User";
import nodemailer from "nodemailer";

export async function POST(req) {
    try {
        await connectDb();
        const body = await req.json();
        const { jobId, userId, coverLetter } = body;

        if (!jobId || !userId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const user = await User.findById(userId);
        const job = await Job.findById(jobId).populate("company"); 
        
        if (!user || !job) {
            return NextResponse.json({ message: "User or Job not found" }, { status: 404 });
        }

        const existingApp = await Application.findOne({ jobId, applicantId: userId });
        if (existingApp) {
            return NextResponse.json({ message: "Already applied" }, { status: 400 });
        }

        const newApp = new Application({
            jobId,
            applicantId: userId,
            coverLetter: coverLetter || "Applied via JobBot AI",
            resumeUrl: user.resumeUrl || "",   
            resumeName: user.resumeName || "", 
            status: "Applied"
        });

        await newApp.save();

        await Job.findByIdAndUpdate(jobId, {
            $addToSet: { applicants: userId }
        });
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // The beautifully styled HTML from your template
            const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .header { background: #2563eb; padding: 30px; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
                .content { padding: 40px 30px; }
                .status-icon { text-align: center; margin-bottom: 20px; }
                .status-icon span { display: inline-block; width: 60px; height: 60px; line-height: 60px; background: #dcfce7; color: #166534; border-radius: 50%; font-size: 30px; }
                .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; }
                .label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 5px; }
                .value { font-size: 16px; color: #1e293b; font-weight: 500; }
                .ai-badge { display: inline-block; background: #f3e8ff; color: #7e22ce; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 10px; }
                .btn { display: block; width: 100%; text-align: center; background: #2563eb; color: white; padding: 14px 0; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 30px; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>JobFinder.</h1>
                </div>
                <div class="content">
                  <div class="status-icon"><span>✓</span></div>
                  <h2 style="text-align: center; color: #1e293b; margin-top: 0;">Application Sent!</h2>
                  <p style="text-align: center; color: #64748b; line-height: 1.6;">
                    Hi <strong>${user.firstName}</strong>, your profile and resume have been successfully sent to the recruiting team by JobBot.
                  </p>

                  <div class="card">
                    <div style="margin-bottom: 15px;">
                      <div class="label">Applying For</div>
                      <div class="value" style="font-size: 18px; font-weight: 700;">${job.title}</div>
                      <div style="font-size: 14px; color: #64748b;">${job.company?.name || "Confidential"}</div>
                    </div>
                    
                    <div style="border-top: 1px solid #e2e8f0; margin: 15px 0;"></div>

                    <div style="margin-bottom: 15px;">
                      <div class="label">Attached Resume</div>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">📄</span>
                        <div>
                           <div class="value">${user.resumeName || "Master Resume Attached"}</div>
                           <div style="font-size: 12px; color: #94a3b8;">Linked from your profile</div>
                        </div>
                      </div>
                    </div>

                    <div style="border-top: 1px solid #e2e8f0; margin: 15px 0;"></div>

                    <div>
                      <span class="ai-badge">Generated by AI</span>
                      <div class="label">Cover Letter Summary</div>
                      <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 5px; font-style: italic;">
                        "${coverLetter || 'Submitted via JobBot AI Agent'}"
                      </p>
                    </div>

                  </div>

                  <p style="text-align: center; font-size: 13px; color: #64748b;">
                    A copy of this application has been saved to your dashboard for your records.
                  </p>

                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/myApplications" class="btn">
                    Track Application Status
                  </a>
                </div>
                <div class="footer">
                  &copy; ${new Date().getFullYear()} JobFinder Inc. All rights reserved.
                </div>
              </div>
            </body>
            </html>
            `;

            const mailOptions = {
                from: `"JobFinder AI" <${process.env.EMAIL_USER}>`,
                to: user.email, 
                subject: `Application Submitted: ${job.title}`,
                html: emailHtml, // Attach the beautiful template!
            };

            await transporter.sendMail(mailOptions);
            console.log("Beautiful HTML Email sent to:", user.email);
            
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
        }

        return NextResponse.json({ success: true, message: "AI Application submitted & email sent!" }, { status: 200 });

    } catch (error) {
        console.error("AI Apply Error:", error);
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}