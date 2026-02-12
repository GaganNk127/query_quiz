import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Test configuration
const TEST_RECEIVER = 'gagannaik127@gmail.com';

console.log('\n' + '='.repeat(70));
console.log('📧 EMAIL SERVICE COMPREHENSIVE DEBUG & TEST SCRIPT');
console.log('='.repeat(70));

// Step 1: Environment Variables Check
console.log('\n📋 STEP 1: CHECKING ENVIRONMENT VARIABLES');
console.log('-'.repeat(70));

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER) {
    console.error('❌ EMAIL_USER is not defined in .env');
    process.exit(1);
} else {
    console.log(`✅ EMAIL_USER: ${EMAIL_USER}`);
}

if (!EMAIL_PASS) {
    console.error('❌ EMAIL_PASS is not defined in .env');
    process.exit(1);
} else {
    const maskedPass = EMAIL_PASS.substring(0, 4) + '*'.repeat(Math.max(0, EMAIL_PASS.length - 4));
    console.log(`✅ EMAIL_PASS: ${maskedPass}`);
    console.log(`   Length: ${EMAIL_PASS.length} characters`);
    console.log(`   Has spaces: ${/\s/.test(EMAIL_PASS) ? 'Yes (will be removed)' : 'No'}`);
}

console.log(`✅ Test Receiver: ${TEST_RECEIVER}`);

// Step 2: Create Transporter
console.log('\n🔧 STEP 2: CREATING EMAIL TRANSPORTER');
console.log('-'.repeat(70));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS.replace(/\s/g, '') // Remove any spaces from app password
    }
});

console.log('✅ Transporter created with Gmail service');

// Step 3: Verify SMTP Connection
console.log('\n🔌 STEP 3: VERIFYING SMTP CONNECTION');
console.log('-'.repeat(70));

try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    console.log('✅ Server is ready to send emails');
} catch (error) {
    console.error('❌ SMTP connection verification FAILED!');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);

    if (error.code === 'EAUTH') {
        console.error('\n🔴 AUTHENTICATION ERROR - Action Required:');
        console.error('   1. Go to: https://myaccount.google.com/security');
        console.error('   2. Enable "2-Step Verification"');
        console.error('   3. Go to: https://myaccount.google.com/apppasswords');
        console.error('   4. Generate a new App Password for "Mail"');
        console.error('   5. Copy the 16-character password (without spaces)');
        console.error('   6. Update .env: EMAIL_PASS=your-16-char-password');
        console.error('   7. Restart this script');
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
        console.error('\n🔴 NETWORK ERROR:');
        console.error('   - Check your internet connection');
        console.error('   - Check if firewall is blocking SMTP ports');
        console.error('   - Try disabling VPN if active');
    }

    process.exit(1);
}

// Step 4: Test Basic Email Sending
console.log('\n📤 STEP 4: TESTING BASIC EMAIL SEND');
console.log('-'.repeat(70));

try {
    const info = await transporter.sendMail({
        from: `"SmartRecruit AI Test" <${EMAIL_USER}>`,
        to: TEST_RECEIVER,
        subject: '✅ Email Service Test - ' + new Date().toLocaleString(),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #28a745; border-radius: 10px;">
                <h1 style="color: #28a745; text-align: center;">✅ Email Service Working!</h1>
                <p style="font-size: 16px;">This is a basic test email from your SmartRecruit AI application.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Test Details:</h3>
                    <ul>
                        <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
                        <li><strong>Sender:</strong> ${EMAIL_USER}</li>
                        <li><strong>Receiver:</strong> ${TEST_RECEIVER}</li>
                        <li><strong>Service:</strong> Gmail SMTP</li>
                    </ul>
                </div>
                <p style="color: #28a745; font-weight: bold; text-align: center;">🎉 If you see this, basic email sending is working!</p>
            </div>
        `
    });

    console.log('✅ Basic email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
} catch (error) {
    console.error('❌ Failed to send basic email');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
}

// Step 5: Test All Email Templates
console.log('\n📧 STEP 5: TESTING ALL EMAIL TEMPLATES');
console.log('-'.repeat(70));

const emailTests = [
    {
        name: '1. Welcome Email (Candidate)',
        fn: async () => {
            return await transporter.sendMail({
                from: `"SmartRecruit AI" <${EMAIL_USER}>`,
                to: TEST_RECEIVER,
                subject: 'Welcome to SmartRecruit AI, Test User!',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2>Welcome aboard! 🚀</h2>
                        <p>Hi Test User,</p>
                        <p>Thank you for joining <strong>SmartRecruit AI</strong> as a <strong>candidate</strong>.</p>
                        <p>We're excited to have you with us. Start exploring jobs and take quizzes to boost your profile!</p>
                        <br>
                        <p>Best regards,<br>The SmartRecruit AI Team</p>
                    </div>
                `
            });
        }
    },
    {
        name: '2. Welcome Email (Recruiter)',
        fn: async () => {
            return await transporter.sendMail({
                from: `"SmartRecruit AI" <${EMAIL_USER}>`,
                to: TEST_RECEIVER,
                subject: 'Welcome to SmartRecruit AI, Test Recruiter!',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2>Welcome aboard! 🚀</h2>
                        <p>Hi Test Recruiter,</p>
                        <p>Thank you for joining <strong>SmartRecruit AI</strong> as a <strong>recruiter</strong>.</p>
                        <p>We're excited to have you with us. Start posting jobs and finding the best talent!</p>
                        <br>
                        <p>Best regards,<br>The SmartRecruit AI Team</p>
                    </div>
                `
            });
        }
    },
    {
        name: '3. Application Received Email',
        fn: async () => {
            return await transporter.sendMail({
                from: `"SmartRecruit AI" <${EMAIL_USER}>`,
                to: TEST_RECEIVER,
                subject: 'Application Received: Senior Software Engineer',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2>Application Submitted Successfully ✅</h2>
                        <p>Hi Test Candidate,</p>
                        <p>We have received your application for the position of <strong>Senior Software Engineer</strong> at <strong>Tech Corp Inc.</strong>.</p>
                        <p>The recruiter will review your profile and get back to you shortly.</p>
                        <br>
                        <p>Good luck!</p>
                    </div>
                `
            });
        }
    },
    {
        name: '4. New Applicant Notification',
        fn: async () => {
            return await transporter.sendMail({
                from: `"SmartRecruit AI" <${EMAIL_USER}>`,
                to: TEST_RECEIVER,
                subject: 'New Applicant for Senior Software Engineer',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2>New Job Application 📄</h2>
                        <p>You have a new applicant, <strong>John Doe</strong>, for the position of <strong>Senior Software Engineer</strong>.</p>
                        <p><a href="http://localhost:5173/candidates/123" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Candidate Profile</a></p>
                    </div>
                `
            });
        }
    },
    {
        name: '5. Quiz Assigned Email',
        fn: async () => {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);

            return await transporter.sendMail({
                from: `"SmartRecruit AI" <${EMAIL_USER}>`,
                to: TEST_RECEIVER,
                subject: 'Action Required: Assessment for Senior Software Engineer',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2>Skill Assessment Assigned 📝</h2>
                        <p>Hi Test Candidate,</p>
                        <p>You have been assigned a skill assessment quiz for the <strong>Senior Software Engineer</strong> position.</p>
                        <p><strong>Deadline:</strong> ${expiryDate.toLocaleDateString()}</p>
                        <br>
                        <p><a href="http://localhost:5173/quiz/abc123" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Take Quiz Now</a></p>
                        <p>Please ensure you are in a quiet environment with your camera enabled.</p>
                    </div>
                `
            });
        }
    },
    {
        name: '6. Quiz Completed Email',
        fn: async () => {
            return await transporter.sendMail({
                from: `"SmartRecruit AI" <${EMAIL_USER}>`,
                to: TEST_RECEIVER,
                subject: 'Quiz Completed: John Doe - 85%',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2>Assessment Completed 🎯</h2>
                        <p><strong>John Doe</strong> has completed the assessment for <strong>Senior Software Engineer</strong>.</p>
                        <h3>Score: 85%</h3>
                        <p><a href="http://localhost:5173/results/xyz789" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Detailed Results</a></p>
                    </div>
                `
            });
        }
    },
    {
        name: '7. Shortlisted Email',
        fn: async () => {
            return await transporter.sendMail({
                from: `"SmartRecruit AI" <${EMAIL_USER}>`,
                to: TEST_RECEIVER,
                subject: 'Congratulations! You\'ve been shortlisted for Senior Software Engineer',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2>You are Shortlisted! 🎉</h2>
                        <p>Hi Test Candidate,</p>
                        <p>Great news! Your application for <strong>Senior Software Engineer</strong> has been shortlisted by the recruiter.</p>
                        <p>They will be in touch with you shortly regarding the next steps.</p>
                        <br>
                        <p>Keep up the great work!</p>
                    </div>
                `
            });
        }
    }
];

let successCount = 0;
let failCount = 0;

for (const test of emailTests) {
    try {
        const info = await test.fn();
        console.log(`✅ ${test.name}`);
        console.log(`   Message ID: ${info.messageId}`);
        successCount++;

        // Wait 1 second between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error(`❌ ${test.name}`);
        console.error(`   Error: ${error.message}`);
        failCount++;
    }
}

// Final Summary
console.log('\n' + '='.repeat(70));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(70));
console.log(`✅ Successful: ${successCount}/${emailTests.length + 1} emails`);
console.log(`❌ Failed: ${failCount}/${emailTests.length + 1} emails`);
console.log(`📬 Receiver: ${TEST_RECEIVER}`);
console.log(`📧 Sender: ${EMAIL_USER}`);

if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log(`\n📥 Check the inbox at ${TEST_RECEIVER} for ${successCount} test emails.`);
    console.log('\n✅ Your email service is fully functional and ready to use!');
} else {
    console.log('\n⚠️ SOME TESTS FAILED!');
    console.log('Please review the errors above and fix the issues.');
}

console.log('='.repeat(70) + '\n');
