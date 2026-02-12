import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const useEmailService = () => {
  const sendEmail = async (templateName, templateParams) => {
    try {
      const response = await axios.post(`${API_URL}/api/email/send-template`, {
        template: templateName,
        params: templateParams
      })

      console.log('Email sent successfully:', response.data)
      return { success: true, response: response.data }
    } catch (error) {
      console.error('Email send error:', error.response?.data || error.message)
      return { success: false, error: error.response?.data?.message || error.message }
    }
  }

  const sendShortlistEmail = async (candidateEmail, candidateName, jobTitle = 'Position', companyName = 'Company') => {
    const templateParams = {
      email: candidateEmail,
      name: candidateName,
      jobTitle: jobTitle,
      company: companyName
    }

    const result = await sendEmail('shortlist', templateParams)

    if (result.success) {
      toast.success('Shortlist email sent successfully!')
    } else {
      toast.error('Failed to send shortlist email')
    }

    return result
  }

  const sendRejectionEmail = async (candidateEmail, candidateName, jobTitle = 'Position', companyName = 'Company') => {
    const templateParams = {
      email: candidateEmail,
      name: candidateName,
      jobTitle: jobTitle,
      company: companyName
    }

    const result = await sendEmail('rejection', templateParams)

    if (result.success) {
      toast.success('Rejection email sent successfully!')
    } else {
      toast.error('Failed to send rejection email')
    }

    return result
  }

  const sendQuizAssignedEmail = async (candidateEmail, candidateName, jobTitle = 'Position', companyName = 'Company') => {
    const templateParams = {
      email: candidateEmail,
      name: candidateName,
      jobTitle: jobTitle,
      company: companyName,
      quizLink: `${window.location.origin}/candidate/quiz`,
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
    }

    const result = await sendEmail('quizAssigned', templateParams)

    if (result.success) {
      toast.success('Quiz assignment email sent successfully!')
    } else {
      toast.error('Failed to send quiz assignment email')
    }

    return result
  }

  const sendCustomEmail = async (email, subject, body) => {
    try {
      const response = await axios.post(`${API_URL}/api/email/send-custom`, {
        to: email,
        subject,
        body
      })

      toast.success('Email sent successfully!')
      return { success: true, response: response.data }
    } catch (error) {
      console.error('Custom email send error:', error.response?.data || error.message)
      toast.error('Failed to send email')
      return { success: false, error: error.response?.data?.message || error.message }
    }
  }

  return {
    sendShortlistEmail,
    sendRejectionEmail,
    sendQuizAssignedEmail,
    sendCustomEmail
  }
}

// Email template functions for different scenarios
export const emailTemplates = {
  shortlist: {
    subject: 'Congratulations! You have been shortlisted',
    template: (candidateName, jobTitle, companyName) => `
      Dear ${candidateName},
      
      Congratulations! We are pleased to inform you that you have been shortlisted for the ${jobTitle} position at ${companyName}.
      
      Your application stood out among many qualified candidates, and we would like to invite you for the next round of interviews.
      
      Our hiring team will contact you shortly to schedule a convenient time for the interview.
      
      If you have any questions in the meantime, please don't hesitate to reach out.
      
      Best regards,
      The Hiring Team
      ${companyName}
    `
  },

  rejection: {
    subject: 'Update on your application',
    template: (candidateName, jobTitle, companyName) => `
      Dear ${candidateName},
      
      Thank you for your interest in the ${jobTitle} position at ${companyName} and for taking the time to apply.
      
      After careful consideration of your application and assessment results, we have decided not to proceed with your candidacy at this time.
      
      This decision does not reflect on your qualifications, and we encourage you to apply for future positions that match your skills and experience.
      
      We wish you the best in your job search and appreciate your interest in ${companyName}.
      
      Best regards,
      The Hiring Team
      ${companyName}
    `
  },

  quizAssigned: {
    subject: 'Assessment Quiz Required - Next Step in Your Application',
    template: (candidateName, jobTitle, companyName, quizLink) => `
      Dear ${candidateName},
      
      Thank you for your interest in the ${jobTitle} position at ${companyName}. Your resume has passed our initial ATS screening, and we would like you to complete the next step in our evaluation process.
      
      Please take the assessment quiz by clicking on the link below:
      ${quizLink}
      
      Quiz Details:
      - Duration: Approximately 15-20 minutes
      - Questions: 10 questions covering various difficulty levels
      - Requirements: Camera access for proctoring
      - Instructions: Please complete the quiz in a quiet environment without interruptions
      
      Important Notes:
      - The quiz must be completed in one session
      - You cannot go back to previous questions
      - Make sure you have a stable internet connection
      - Ensure your camera is working before starting
      
      This assessment helps us better understand your skills and how they align with the position requirements.
      
      Please complete the quiz within 3 days of receiving this email.
      
      If you encounter any technical issues, please contact our support team immediately.
      
      We look forward to reviewing your assessment results!
      
      Best regards,
      The Hiring Team
      ${companyName}
    `
  },

  interviewScheduled: {
    subject: 'Interview Scheduled - Next Step in Your Application',
    template: (candidateName, jobTitle, companyName, interviewDate, interviewTime, interviewType) => `
      Dear ${candidateName},
      
      Congratulations! We are pleased to invite you for an interview for the ${jobTitle} position at ${companyName}.
      
      Interview Details:
      - Date: ${interviewDate}
      - Time: ${interviewTime}
      - Type: ${interviewType} (Video call/In-person)
      - Duration: 45-60 minutes
      
      ${interviewType === 'Video call' ? `
      Video Call Information:
      - Platform: Zoom/Google Meet
      - Link: [Meeting link will be sent separately]
      - Please test your camera and microphone before the call
      ` : `
      Location: ${companyName} Office
      Address: [Office address]
      Please arrive 10 minutes early
      `}
      
      What to expect:
      - Discussion about your experience and skills
      - Technical questions related to the position
      - Opportunity to ask questions about the role and company
      - Meeting with the hiring team and potential team members
      
      Please confirm your attendance by replying to this email.
      
      If you need to reschedule, please let us know at least 24 hours in advance.
      
      We look forward to speaking with you!
      
      Best regards,
      The Hiring Team
      ${companyName}
    `
  },

  offerExtended: {
    subject: 'Job Offer - ${jobTitle} at ${companyName}',
    template: (candidateName, jobTitle, companyName, salary, startDate) => `
      Dear ${candidateName},
      
      We are thrilled to extend an offer for the ${jobTitle} position at ${companyName}!
      
      Offer Details:
      - Position: ${jobTitle}
      - Company: ${companyName}
      - Start Date: ${startDate}
      - Salary: ${salary}
      - Type: Full-time employment
      
      Next Steps:
      1. Review the detailed offer letter attached to this email
      2. Sign and return the offer letter by [response deadline]
      3. Complete any required pre-employment documentation
      4. Schedule your onboarding orientation
      
      We believe your skills and experience will be a valuable addition to our team, and we are excited to welcome you aboard!
      
      Please feel free to reach out if you have any questions about the offer or the onboarding process.
      
      We look forward to your positive response!
      
      Best regards,
      The Hiring Team
      ${companyName}
    `
  }
}

// Utility function to send emails with fallback
export const sendEmailWithFallback = async (emailFunction, ...args) => {
  try {
    const result = await emailFunction(...args)
    return result
  } catch (error) {
    console.error('Primary email service failed:', error)

    // Fallback: Log the email content for manual sending
    console.log('Email content (fallback):', args)
    toast.error('Email service temporarily unavailable. Your message has been logged.')

    return { success: false, fallback: true, error: error.message }
  }
}

export default useEmailService
