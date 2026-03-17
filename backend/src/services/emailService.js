const { Resend } = require('resend');
const { getEnvConfig } = require('../config/env');

const config = getEnvConfig();

// Read API key gracefully
const apiKey = config.resendApiKey || process.env.RESEND_API_KEY;

// Initialize Resend only if key exists to prevent fatal startup crashes
const resend = apiKey ? new Resend(apiKey) : null;

const FROM_EMAIL = 'onboarding@resend.dev';

async function sendEmail({ to, subject, html, text }) {
    if (!resend) {
        console.error('Email Dispatch Error: RESEND_API_KEY is not configured in this environment.');
        return false;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `DevSpace <${FROM_EMAIL}>`,
            to,
            subject,
            html,
            text
        });

        if (error) {
            console.error('Email API Error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Email Dispatch Error:', error.message);
        return false;
    }
}

async function sendOTPEmail(email, otp) {
    console.log(`\n[DEV SECURITY] OTP for ${email}: ${otp}\n`);
    
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; color: #ffffff; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">DEVSPACE</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Secure Authorization Node</p>
            </div>
            <div style="background-color: #0f172a; padding: 30px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
                <p style="font-size: 16px; margin-bottom: 25px;">Please use the following code to complete your registration:</p>
                <div style="font-size: 42px; font-weight: 800; letter-spacing: 15px; color: #3b82f6; margin: 20px 0; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px dashed #3b82f6;">
                    ${otp}
                </div>
                <p style="font-size: 12px; color: #94a3b8; margin-top: 25px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
            <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 2px;">
                DevSpace Protocol // Automated Terminal Response
            </div>
        </div>
    `;

    return await sendEmail({
        to: email,
        subject: 'DevSpace - Verify Your Identity',
        html
    });
}

async function sendInvitationEmail(email, projectName, inviteToken) {
    // Determine the base URL dynamically or fallback to localhost for development
    const baseUrl = config.frontendUrl || process.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5173';
    const inviteUrl = `${baseUrl}/accept-invitation/${inviteToken}`;
    console.log(`\n[DEV SECURITY] Invite URL for ${email}: ${inviteUrl}\n`);

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; color: #ffffff; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">DEVSPACE</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Project Collaboration Gateway</p>
            </div>
            <div style="background-color: #0f172a; padding: 30px; border-radius: 12px; border: 1px solid #334155;">
                <p style="font-size: 18px; color: #f8fafc; margin-bottom: 20px; font-weight: 600;">You've been invited to join <strong>${projectName}</strong></p>
                <p style="font-size: 14px; color: #94a3b8, line-height: 1.6; margin-bottom: 30px;">
                    A collaborator has invited you to join their development node on DevSpace. 
                    Granting access will allow you to view files, participate in chats, and contribute to tasks.
                </p>
                <div style="text-align: center;">
                    <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-weight: 800; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">
                        Accept Invitation
                    </a>
                </div>
                <p style="font-size: 11px; color: #475569; margin-top: 30px; text-align: center;">
                    This invitation expires in 24 hours.
                </p>
            </div>
            <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 2px;">
                DevSpace Protocol // Secure Access Link
            </div>
        </div>
    `;

    return await sendEmail({
        to: email,
        subject: `DevSpace - Invitation to join ${projectName}`,
        html
    });
}

module.exports = {
    sendEmail,
    sendOTPEmail,
    sendInvitationEmail
};
