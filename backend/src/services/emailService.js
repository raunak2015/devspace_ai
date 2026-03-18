// Using native fetch for the Brevo HTTP API to bypass Render's SMTP port blocks
const { getEnvConfig } = require('../config/env');

const config = getEnvConfig();

// Read Brevo API key (it's the same as the SMTP pass)
const apiKey = config.emailPass || process.env.EMAIL_PASS;
// The sender email should be the user's registered Brevo email
const senderEmail = config.emailUser || process.env.EMAIL_USER || 'srr0607378@gmail.com'; 

async function sendEmail({ to, subject, html, text }) {
    if (!apiKey) {
        console.error('Email Error: Missing EMAIL_PASS (Brevo API Key) in environment variables.');
        return false;
    }

    const payload = {
        sender: { name: "DevSpace", email: senderEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text || 'Please view this email in an HTML-compatible client.'
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Brevo API Error:', errorData);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Email Dispatch HTTP Error:', error.message);
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
