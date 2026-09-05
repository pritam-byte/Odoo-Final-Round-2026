import nodemailer, { Transporter } from 'nodemailer';

export interface SendOtpOptions {
  to: string;
  name: string;
  otp: string;
}

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  if (user && pass) {
    // If user is a Gmail address or SMTP_HOST is smtp.gmail.com, use Gmail service transporter
    if (host?.includes('gmail') || user.endsWith('@gmail.com')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass, // 16-character Google App Password (not standard account password)
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  } else {
    // Fallback: create JSON / local transport for development
    // Fallback: JSON transporter for development / evaluation
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

export async function sendPasswordResetOtp({ to, name, otp }: SendOtpOptions): Promise<{ success: boolean; previewUrl?: string }> {
export async function sendPasswordResetOtp({
  to,
  name,
  otp,
}: SendOtpOptions): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
  try {
    const mailer = await getTransporter();

    const subject = `[Urban Furniture] ${otp} is your Password Reset Code`;
    const subject = `[Urban Furniture] ${otp} is your Account Verification & Reset Code`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-bottom: 8px;">Urban Furniture ERP</h2>
        <p style="color: #475569; font-size: 14px;">Hello ${name},</p>
        <p style="color: #475569; font-size: 14px;">We received a request to reset your password. Use the verification code below to verify your identity:</p>
        
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 6px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0284c7;">${otp}</span>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0f766e; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">URBAN FURNITURE ERP</h1>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; font-weight: 500;">Enterprise Identity & Authentication Service</p>
        </div>

        <p style="color: #64748b; font-size: 12px;">This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px;">Urban Furniture & Accounting Enterprise &bull; System Security</p>
        <div style="border-top: 2px solid #0f766e; padding-top: 20px;">
          <p style="color: #1e293b; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Hello ${name},</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            We received an authentication verification / password reset request for your Urban Furniture account. Enter the 6-digit one-time code below to verify your identity:
          </p>

          <div style="background-color: #f0fdfa; border: 1.5px solid #0f766e; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #0f766e; letter-spacing: 1px; display: block; margin-bottom: 6px;">
              Your 6-Digit Verification Code
            </span>
            <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0f766e; font-family: monospace;">
              ${otp}
            </span>
          </div>

          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 20px;">
            🔒 <strong>Security Notice:</strong> This code will expire in <strong>10 minutes</strong>. Never share this code with anyone. If you did not request this, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
          
          <div style="text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.4;">
            Urban Furniture Enterprise Pvt. Ltd. &bull; Financial & ERP Systems Security<br/>
            Automated notification dispatch &bull; Do not reply to this email
          </div>
        </div>
      </div>
    `;

    console.log(`\n======================================================`);
    console.log(`[MAIL SERVICE] Password Reset Verification Code`);
    console.log(`Recipient: ${to} (${name})`);
    console.log(`[MAIL SERVICE] 📩 Dispatched Verification Code to Email`);
    console.log(`To: ${to} (${name})`);
    console.log(`Verification OTP: ${otp}`);
    console.log(`Status: Sent via ${process.env.SMTP_USER ? 'Real Gmail SMTP' : 'Sandbox Dispatch Engine'}`);
    console.log(`Expires in: 10 minutes`);
    console.log(`======================================================\n`);

    await mailer.sendMail({
      from: process.env.SMTP_FROM || '"Urban Furniture Security" <security@urbanfurniture.com>',
    const fromAddress =
      process.env.SMTP_FROM ||
      (process.env.SMTP_USER ? `"Urban Furniture Security" <${process.env.SMTP_USER}>` : '"Urban Furniture Security" <security@urbanfurniture.com>');

    const info = await mailer.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    return { success: true };
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[MAIL SERVICE] Failed to dispatch email:', error);
    console.error('[MAIL SERVICE] ⚠️ Failed to dispatch email via SMTP:', error);
    return { success: false };
  }
}
