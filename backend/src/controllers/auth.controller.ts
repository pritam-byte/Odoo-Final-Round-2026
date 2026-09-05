import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { JWT_SECRET } from "../config/constants";

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

export async function resetPassword(req: Request, res: Response) {
  try {
    const { identifier, newPassword } = req.body;
    if (!identifier || !newPassword) {
      return res.status(400).json({ error: "Login ID or Email and new password are required" });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: identifier }, { email: identifier }],
      },
    });

    if (!user) {
      return res.status(404).json({ error: "No account found matching this Login ID or Email" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password updated successfully in database" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to reset password" });
  }
}