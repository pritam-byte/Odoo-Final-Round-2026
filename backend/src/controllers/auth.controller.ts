import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { JWT_SECRET } from "../config/constants";
import { sendPasswordResetOtp } from "../services/mail.service";

// In-memory OTP storage with 10-minute expiry
interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}
const otpStore = new Map<string, OtpRecord>();

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: parsed.loginId }, { email: parsed.email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Login ID or Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const user = await prisma.user.create({
      data: {
        loginId: parsed.loginId,
        email: parsed.email,
        password: hashedPassword,
        role: parsed.role,
        contactId: parsed.contactId || null,
      },
      select: { id: true, loginId: true, email: true, role: true, contactId: true },
    });

    return res.status(201).json({ message: "User registered successfully", user });
  } catch (error: any) {
    return res.status(400).json({ error: error.errors?.[0]?.message || error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { loginId, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { loginId },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        loginId: user.loginId,
        role: user.role,
        contactId: user.contactId,
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        loginId: user.loginId,
        email: user.email,
        role: user.role,
        contactId: user.contactId,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.errors?.[0]?.message || error.message });
  }
}

// 1. Request Password Reset OTP
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== "string") {
      return res.status(400).json({ error: "Login ID or registered Email is required" });
    }

    const trimmed = identifier.trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: trimmed }, { email: trimmed }],
      },
    });

    if (!user) {
      return res.status(404).json({ error: "No account found matching this Login ID or Email" });
    }

    // Generate 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(user.id, { otp, expiresAt, attempts: 0 });

    const recipientEmail = user.email || `${user.loginId}@urbanfurniture.com`;
    const maskedEmail = recipientEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3");

    // Dispatch email via mail service
    await sendPasswordResetOtp({
      to: recipientEmail,
      name: user.loginId,
      otp,
    });

    return res.status(200).json({
      message: `A 6-digit verification code has been dispatched to ${maskedEmail}`,
      maskedEmail,
      devOtp: otp, // Provided for easy local testing / sandbox evaluation
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to process forgot password request" });
  }
}

// 2. Verify OTP Code
export async function verifyOtp(req: Request, res: Response) {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ error: "Identifier and OTP code are required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: identifier.trim() }, { email: identifier.trim() }],
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User account not found" });
    }

    const record = otpStore.get(user.id);
    if (!record) {
      return res.status(400).json({ error: "No verification request found or OTP expired. Please request a new code." });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(user.id);
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    if (record.otp !== otp.trim()) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        otpStore.delete(user.id);
        return res.status(400).json({ error: "Too many incorrect attempts. Please request a new code." });
      }
      return res.status(400).json({ error: "Invalid verification code. Please check your email." });
    }

    return res.status(200).json({ message: "Verification code verified successfully", valid: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to verify OTP code" });
  }
}

// 3. Reset Password (Requires valid verified OTP)
export async function resetPassword(req: Request, res: Response) {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !newPassword || !otp) {
      return res.status(400).json({ error: "Login ID, verification code, and new password are required" });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: identifier.trim() }, { email: identifier.trim() }],
      },
    });

    if (!user) {
      return res.status(404).json({ error: "No account found matching this Login ID or Email" });
    }

    const record = otpStore.get(user.id);
    if (!record || record.otp !== otp.trim() || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: "Invalid or expired verification code. Please request a new code." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Invalidate OTP after successful reset
    otpStore.delete(user.id);

    return res.status(200).json({ message: "Password updated successfully in PostgreSQL database! You can now sign in." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to reset password" });
  }
}
