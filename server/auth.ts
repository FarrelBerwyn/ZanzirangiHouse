import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { getDatabaseAdapter } from './database/index.ts';
import { env } from './config/env.ts';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: (env.JWT_EXPIRES_IN || '7d') as any }
  );
}

export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

export async function authenticateAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Check Authorization header first
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.zanzirangi_admin_token) {
    token = req.cookies.zanzirangi_admin_token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in to Zanzirangi CMS.',
    });
    return;
  }

  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.',
    });
    return;
  }

  try {
    // Verify user still exists in database
    const dbUser = await getDatabaseAdapter().findUserByEmail(user.email);
    if (!dbUser) {
      res.status(403).json({
        success: false,
        error: 'User account is no longer authorized.',
      });
      return;
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    };

    next();
  } catch (err: any) {
    console.error('Authentication verification error:', err.message);
    res.status(500).json({ success: false, error: 'Database verification failed.' });
  }
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await getDatabaseAdapter().findUserByEmail(normalizedEmail);
  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const payload: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = generateToken(payload);
  return {
    success: true,
    user: payload,
    token,
  };
}

