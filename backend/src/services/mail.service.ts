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
  } else {
    // Fallback: create JSON / local transport for development
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

export async function sendPasswordResetOtp({ to, name, otp }: SendOtpOptions): Promise<{ success: boolean; previewUrl?: string }> {
  try {
    const mailer = await getTransporter();

    const subject = `[Urban Furniture] ${otp} is your Password Reset Code`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-bottom: 8px;">Urban Furniture ERP</h2>
        <p style="color: #475569; font-size: 14px;">Hello ${name},</p>
        <p style="color: #475569; font-size: 14px;">We received a request to reset your password. Use the verification code below to verify your identity:</p>
        
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 6px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0284c7;">${otp}</span>
        </div>

        <p style="color: #64748b; font-size: 12px;">This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px;">Urban Furniture & Accounting Enterprise &bull; System Security</p>
      </div>
    `;

    console.log(`\n======================================================`);
    console.log(`[MAIL SERVICE] Password Reset Verification Code`);
    console.log(`Recipient: ${to} (${name})`);
    console.log(`Verification OTP: ${otp}`);
    console.log(`Expires in: 10 minutes`);
    console.log(`======================================================\n`);

    await mailer.sendMail({
      from: process.env.SMTP_FROM || '"Urban Furniture Security" <security@urbanfurniture.com>',
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('[MAIL SERVICE] Failed to dispatch email:', error);
    return { success: false };
  }
}
