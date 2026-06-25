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

    if (!application) {
        return NextResponse.json({ message: "Application not found" }, { status: 404 });
    }

    // 2. Send Email if Status Requires It
    const emailTriggerStatuses = ["Shortlisted", "Hired", "Selected"];
    
    if (emailTriggerStatuses.includes(status) && process.env.EMAIL_USER) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
           user: process.env.EMAIL_USER,
           pass: process.env.EMAIL_PASS
        }
      });

      const candidate = application.applicantId;
      const job = application.jobId;
      const companyName = job.company?.name || "our company";

      let subject = "";
      let htmlContent = "";

      // --- TEMPLATE 1: SHORTLISTED (INTERVIEW) ---
      if (status === "Shortlisted") {
          subject = `Interview Invitation: ${job.title} at ${companyName}`;
          htmlContent = `
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
                      <p style="margin: 5px 0;"><strong>Date:</strong> ${interviewDetails?.date ? new Date(interviewDetails.date).toDateString() : 'TBD'}</p>
                      <p style="margin: 5px 0;"><strong>Time:</strong> ${interviewDetails?.time || 'TBD'}</p>
                      <p style="margin: 5px 0;"><strong>Mode:</strong> ${interviewDetails?.mode || 'TBD'} ${interviewDetails?.location ? `(${interviewDetails.location})` : ''}</p>
                      ${interviewDetails?.message ? `<p style="margin: 15px 0 0 0; font-style: italic; color: #555;">"${interviewDetails.message}"</p>` : ''}
                  </div>

                  <a href="${interviewDetails?.mode === 'Online' ? interviewDetails.location : '#'}" style="display: block; width: 100%; text-align: center; background: #166534; color: white; padding: 14px 0; border-radius: 6px; text-decoration: none; font-weight: bold;">
                      ${interviewDetails?.mode === 'Online' ? 'Join Meeting Link' : 'Confirm Attendance'}
                  </a>
              </div>
          </div>
          `;
      } 
      // --- TEMPLATE 2: HIRED / SELECTED ---
      else if (status === "Hired" || status === "Selected") {
          subject = `Congratulations! Offer Extended for ${job.title} at ${companyName}`;
          htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background: #4338ca; padding: 25px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">🎉 You're Hired!</h1>
              </div>
              <div style="padding: 30px; background: #fff;">
                  <h2 style="color: #1e293b; margin-top: 0;">Welcome to the team!</h2>
                  <p style="color: #64748b; line-height: 1.6;">
                      Hi <strong>${candidate.firstName}</strong>,<br><br>
                      After a thorough review of your profile and our interviews, we are absolutely thrilled to offer you the position of <strong>${job.title}</strong> at <strong>${companyName}</strong>. 
                  </p>
                  
                  <div style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin: 0 0 10px 0; color: #4338ca; font-size: 16px;">Next Steps</h3>
                      <p style="margin: 0; color: #475569; line-height: 1.5;">
                          Our HR team will be reaching out to you shortly with your official offer letter, compensation details, and onboarding schedule. 
                      </p>
                  </div>

                  <p style="color: #64748b; line-height: 1.6;">
                      We are incredibly excited to see the impact you will make here. Congratulations again!
                  </p>
              </div>
          </div>
          `;
      }

      // 3. Send the Email
      if (htmlContent) {
          const mailOptions = {
            from: `"JobFinder Recruiting" <${process.env.EMAIL_USER}>`,
            to: candidate.email,
            subject: subject,
            html: htmlContent
          };

          await transporter.sendMail(mailOptions);
      }
    }
    
    return NextResponse.json({ success: true, message: `Candidate status updated to ${status}` }, { status: 200 });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}