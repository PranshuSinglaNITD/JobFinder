import { NextResponse } from "next/server";
import Application from "@/models/Application";
import Job from "@/models/Job";
import User from "@/models/User";
import nodemailer from "nodemailer";
import connectDb from "@/middleware/mongoose";

export async function POST(req) {
  try {
    await connectDb();

    // ---------------------------------------------------------
    // 1. CRITICAL FIX: Parse FormData (Not JSON)
    // ---------------------------------------------------------
    const formData = await req.formData();
    
    const userId = formData.get("userId");
    const jobId = formData.get("jobId");
    const resumeFile = formData.get("resume"); // This captures the file object

    // Validation
    if (!userId || !jobId) {
      return NextResponse.json({ message: "Missing required data" }, { status: 400 });
    }

    // 2. Check if already applied
    const existing = await Application.findOne({ jobId, applicantId: userId });
    if (existing) {
      return NextResponse.json({ message: "You have already applied to this job." }, { status: 400 });
    }

    // 3. Create Application Record
    const newApplication = new Application({ 
        jobId, 
        applicantId: userId,
        resumeName: resumeFile ? resumeFile.name : null,
        resumeFileType: resumeFile ? resumeFile.type : null 
    });
    await newApplication.save();

    // 4. Update Job (Add applicant to list)
    await Job.findByIdAndUpdate(jobId, { $push: { applicants: userId } });

    // ---------------------------------------------------------
    // 5. Send Professional Email
    // ---------------------------------------------------------
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const user = await User.findById(userId);
            const job = await Job.findById(jobId);
            
            // Prepare attachment
            let attachments = [];
            if (resumeFile) {
                const arrayBuffer = await resumeFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                attachments.push({
                    filename: resumeFile.name,
                    content: buffer,
                    contentType: resumeFile.type
                });
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // Killer UI Email Template
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
                    Hi <strong>${user.firstName}</strong>, your profile and resume have been successfully sent to the recruiting team.
                  </p>

                  <div class="card">
                    <div style="margin-bottom: 15px;">
                      <div class="label">Applying For</div>
                      <div class="value" style="font-size: 18px; font-weight: 700;">${job.title}</div>
                      <div style="font-size: 14px; color: #64748b;">${job.company.name}</div>
                    </div>
                    
                    <div style="border-top: 1px solid #e2e8f0; margin: 15px 0;"></div>

                    <div>
                      <div class="label">Attached Resume</div>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">📄</span>
                        <div>
                           <div class="value">${resumeFile ? resumeFile.name : "No file attached"}</div>
                           <div style="font-size: 12px; color: #94a3b8;">${resumeFile ? (resumeFile.size / 1024 / 1024).toFixed(2) + ' MB' : ''}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p style="text-align: center; font-size: 13px; color: #64748b;">
                    A copy of your resume is attached to this email for your records.
                  </p>

                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/applications" class="btn">
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

            await transporter.sendMail({
                from: `"JobFinder Team" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Application Sent: ${job.title}`,
                attachments: attachments,
                html: emailHtml
            });

        } catch (emailError) {
            console.error("Email failed but application saved:", emailError);
            // We do NOT return an error to the user if email fails, 
            // because the application itself was successful in the DB.
        }
    }

    return NextResponse.json({ success: true, message: "Application submitted successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Apply Error:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}