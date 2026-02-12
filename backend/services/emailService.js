
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper to send email
export const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials missing in .env. Skipping email to:', to);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"SmartRecruit AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
};

// 1. Welcome Email
export const sendWelcomeEmail = async (email, name, role) => {
  const subject = `Welcome to SmartRecruit AI, ${name}!`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Welcome aboard! 🚀</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining <strong>SmartRecruit AI</strong> as a <strong>${role}</strong>.</p>
      <p>We're excited to have you with us. ${role === 'candidate' ? 'Start exploring jobs and take quizzes to boost your profile!' : 'Start posting jobs and finding the best talent!'}</p>
      <br>
      <p>Best regards,<br>The SmartRecruit AI Team</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

// 2. Job Application Received (To Candidate)
export const sendApplicationReceivedEmail = async (email, name, jobTitle, company) => {
  const subject = `Application Received: ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Application Submitted Successfully ✅</h2>
      <p>Hi ${name},</p>
      <p>We have received your application for the position of <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
      <p>The recruiter will review your profile and get back to you shortly.</p>
      <br>
      <p>Good luck!</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

// 3. New Applicant Notification (To Recruiter)
export const sendNewApplicantEmail = async (recruiterEmail, applicantName, jobTitle, resumeLink) => {
  const subject = `New Applicant for ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>New Job Application 📄</h2>
      <p>You have a new applicant, <strong>${applicantName}</strong>, for the position of <strong>${jobTitle}</strong>.</p>
      <p><a href="${resumeLink}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Candidate Profile</a></p>
    </div>
  `;
  await sendEmail(recruiterEmail, subject, html);
};

// 4. Quiz Assigned (To Candidate)
export const sendQuizAssignedEmail = async (email, name, jobTitle, quizLink, expiryDate) => {
  const subject = `Action Required: Assessment for ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Skill Assessment Assigned 📝</h2>
      <p>Hi ${name},</p>
      <p>You have been assigned a skill assessment quiz for the <strong>${jobTitle}</strong> position.</p>
      <p><strong>Deadline:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
      <br>
      <p><a href="${quizLink}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Take Quiz Now</a></p>
      <p>Please ensure you are in a quiet environment with your camera enabled.</p>
    </div>
  `;
  await sendEmail(email, subject, html);
  console.log("Quiz assigned and mail sent successfully")
};

// 5. Quiz Completed (To Recruiter)
export const sendQuizCompletedEmail = async (recruiterEmail, candidateName, jobTitle, score, resultsLink) => {
  const subject = `Quiz Completed: ${candidateName} - ${score}%`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Assessment Completed 🎯</h2>
      <p><strong>${candidateName}</strong> has completed the assessment for <strong>${jobTitle}</strong>.</p>
      <h3>Score: ${score}%</h3>
      <p><a href="${resultsLink}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Detailed Results</a></p>
    </div>
  `;
  await sendEmail(recruiterEmail, subject, html);
};

// 6. Shortlisted (To Candidate)
export const sendShortlistedEmail = async (email, name, jobTitle) => {
  const subject = `Congratulations! You've been shortlisted for ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>You are Shortlisted! 🎉</h2>
      <p>Hi ${name},</p>
      <p>Great news! Your application for <strong>${jobTitle}</strong> has been shortlisted by the recruiter.</p>
      <p>They will be in touch with you shortly regarding the next steps.</p>
      <br>
      <p>Keep up the great work!</p>
    </div>
  `;
  await sendEmail(email, subject, html);
  console.log("shortlisted and mail sent successfully")
};

// 7. Rejection (To Candidate)
export const sendRejectionEmail = async (email, name, jobTitle, company) => {
  const subject = `Update on your application: ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Dear ${name},</p>
      <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${company}</strong>.</p>
      <p>After careful consideration, we have decided not to proceed with your candidacy at this time.</p>
      <p>We appreciate the time you took to apply and wish you the best in your search.</p>
      <br>
      <p>Best regards,<br>The Hiring Team<br>${company}</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

// 8. Interview Scheduled (To Candidate)
export const sendInterviewScheduledEmail = async (email, name, jobTitle, company, interviewDate, interviewTime, interviewType) => {
  const subject = `Interview Scheduled: ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Interview Invitation 🎉</h2>
      <p>Hi ${name},</p>
      <p>We are pleased to invite you for an interview for the <strong>${jobTitle}</strong> position at <strong>${company}</strong>.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${interviewDate}</p>
        <p><strong>Time:</strong> ${interviewTime}</p>
        <p><strong>Type:</strong> ${interviewType}</p>
      </div>
      <p>We look forward to speaking with you!</p>
      <br>
      <p>Best regards,<br>The Hiring Team<br>${company}</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

// 9. Offer Extended (To Candidate)
export const sendOfferExtendedEmail = async (email, name, jobTitle, company, salary, startDate) => {
  const subject = `Job Offer: ${jobTitle} at ${company}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Job Offer Extended! 🎊</h2>
      <p>Dear ${name},</p>
      <p>We are thrilled to extend an offer to join <strong>${company}</strong> as a <strong>${jobTitle}</strong>.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Salary:</strong> ${salary}</p>
        <p><strong>Start Date:</strong> ${startDate}</p>
      </div>
      <p>Please review the details and let us know your decision.</p>
      <br>
      <p>Welcome to the team!<br>The Hiring Team<br>${company}</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

// 11. Proctoring Violation Alert (To Recruiter)
export const sendProctoringAlertEmail = async (recruiterEmail, candidateName, jobTitle, violations) => {
  const subject = `⚠️ Proctoring Violation Alert: ${candidateName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #dc3545;">Proctoring Violation Detected ⚠️</h2>
      <p>A proctoring violation has been detected during the assessment for <strong>${candidateName}</strong>.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <p><strong>Candidate:</strong> ${candidateName}</p>
        <p><strong>Position:</strong> ${jobTitle}</p>
        <p><strong>Recent Violations:</strong></p>
        <ul>
          ${violations.map(v => `<li>${v}</li>`).join('')}
        </ul>
      </div>
      <p>Please review the candidate's proctoring log in your dashboard for more details.</p>
      <br>
      <p>Best regards,<br>SmartRecruit AI System</p>
    </div>
  `;
  await sendEmail(recruiterEmail, subject, html);
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendApplicationReceivedEmail,
  sendNewApplicantEmail,
  sendQuizAssignedEmail,
  sendQuizCompletedEmail,
  sendShortlistedEmail,
  sendRejectionEmail,
  sendInterviewScheduledEmail,
  sendOfferExtendedEmail,
  sendCustomEmail,
  sendProctoringAlertEmail
};
