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

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ loginId }, { email: loginId }],
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found in database. Redirecting to Sign Up...",
        notFound: true,
      });
    }

    if (!(await bcrypt.compare(password, user.password))) {
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