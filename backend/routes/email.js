import express from 'express';
import * as emailService from '../services/emailService.js';
// Assuming auth middleware exists based on other routes
// import { protect, admin } from '../middleware/auth.js'; 

const router = express.Router();

// Route for generic/custom emails
router.post('/send-custom', async (req, res) => {
    const { to, subject, body } = req.body;
    try {
        await emailService.sendCustomEmail(to, subject, body);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Route for specific templates
router.post('/send-template', async (req, res) => {
    const { template, params } = req.body;
    try {
        let result;
        switch (template) {
            case 'shortlist':
                result = await emailService.sendShortlistedEmail(params.email, params.name, params.jobTitle);
                break;
            case 'rejection':
                result = await emailService.sendRejectionEmail(params.email, params.name, params.jobTitle, params.company);
                break;
            case 'quizAssigned':
                result = await emailService.sendQuizAssignedEmail(params.email, params.name, params.jobTitle, params.quizLink, params.expiryDate);
                break;
            case 'interviewScheduled':
                result = await emailService.sendInterviewScheduledEmail(params.email, params.name, params.jobTitle, params.company, params.interviewDate, params.interviewTime, params.interviewType);
                break;
            case 'offerExtended':
                result = await emailService.sendOfferExtendedEmail(params.email, params.name, params.jobTitle, params.company, params.salary, params.startDate);
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid template' });
        }
        res.status(200).json({ success: true, message: 'Template email sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
