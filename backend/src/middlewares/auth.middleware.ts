import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants";

export interface AuthPayload {
  sub: string;
  loginId: string;
  role: "ADMIN" | "ACCOUNTANT" | "PORTAL_USER";
  contactId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as AuthPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function authorizeRoles(...allowedRoles: Array<"ADMIN" | "ACCOUNTANT" | "PORTAL_USER">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Access denied for your role" });
    }
    next();
  };
}