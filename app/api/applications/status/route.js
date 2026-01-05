import { NextResponse } from "next/server";
import Application from "@/models/Application";
import User from "@/models/User";
import nodemailer from "nodemailer";
import connectDb from "@/middleware/mongoose";

export async function PUT(req) {
  try {
    await connectDb();
    const { applicationId, status, interviewDetails } = await req.json();

    // 1. Update Application Status
    const application = await Application.findByIdAndUpdate(
      applicationId, 
      { status }, 
      { new: true }
    ).populate("applicantId").populate("jobId");

    if (!application) return NextResponse.json({ message: "Application not found" }, { status: 404 });

    // 2. Send Email if Shortlisted
    if (status === "Shortlisted" && process.env.EMAIL_USER) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
           user: process.env.EMAIL_USER,
           pass: process.env.EMAIL_PASS
        }
      });

      const candidate = application.applicantId;
      const job = application.jobId;

      const mailOptions = {
        from: `"JobFinder Recruiting" <${process.env.EMAIL_USER}>`,
        to: candidate.email,
        subject: `Interview Invitation: ${job.title} at ${job.company.name}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background: #166534; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Good News!</h1>
            </div>
            <div style="padding: 30px; background: #fff;">
                <h2 style="color: #1e293b; margin-top: 0;">You've been Shortlisted!</h2>
                <p style="color: #64748b; line-height: 1.6;">
                    Hi <strong>${candidate.firstName}</strong>,<br>
                    We are pleased to inform you that your application for <strong>${job.title}</strong> has been accepted. We would like to invite you for an interview.
                </p>

                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 15px 0; color: #166534; font-size: 16px;">📅 Interview Details</h3>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(interviewDetails.date).toDateString()}</p>
                    <p style="margin: 5px 0;"><strong>Time:</strong> ${interviewDetails.time}</p>
                    <p style="margin: 5px 0;"><strong>Mode:</strong> ${interviewDetails.mode} (${interviewDetails.location})</p>
                    ${interviewDetails.message ? `<p style="margin: 15px 0 0 0; font-style: italic; color: #555;">"${interviewDetails.message}"</p>` : ''}
                </div>

                <a href="${interviewDetails.mode === 'Online' ? interviewDetails.location : '#'}" style="display: block; width: 100%; text-align: center; background: #166534; color: white; padding: 14px 0; border-radius: 6px; text-decoration: none; font-weight: bold;">
                    ${interviewDetails.mode === 'Online' ? 'Join Meeting Link' : 'Confirm Attendance'}
                </a>
            </div>
        </div>
        `
      };

      await transporter.sendMail(mailOptions);
    }
    
    // Optional: Send Rejection Email logic could go here too

    return NextResponse.json({ success: true, message: `Candidate ${status}` }, { status: 200 });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}