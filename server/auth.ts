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
  status: 'active' | 'disabled';
  permissions: string[];
  tokenVersion?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Module permissions an admin can be granted. Superadmins have every permission implicitly;
 * user management (admin_access) is reserved for the superadmin role and cannot be granted.
 */
export const ADMIN_PERMISSIONS = [
  'dashboard',
  'pages',
  'homepage',
  'villas',
  'gallery',
  'videos',
  'facilities',
  'testimonials',
  'dining',
  'experiences',
  'safari',
  'transfers',
  'contact',
  'seo',
  'media',
  'settings',
  'support',
] as const;

/** Keeps only known permission keys (drops unknown values, wildcards and non-strings). */
export function sanitizePermissions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<string>(ADMIN_PERMISSIONS);
  return Array.from(new Set(value.filter((p): p is string => typeof p === 'string' && allowed.has(p))));
}

// Constant-cost comparison target so unknown emails take as long as wrong passwords.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('zanzirangi-timing-equalizer', 12);

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      permissions: user.permissions,
      tokenVersion: user.tokenVersion ?? 1,
    },
    env.JWT_SECRET,
    { expiresIn: (env.JWT_EXPIRES_IN || '7d') as any }
  );
}

export function verifyToken(token: string): (AuthenticatedUser & { tokenVersion?: number }) | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser & { tokenVersion?: number };
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

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.',
    });
    return;
  }

  try {
    // Verify user still exists in database (token id and email must both still match)
    const dbUser = await getDatabaseAdapter().findUserByEmail(decoded.email);
    if (!dbUser || (decoded.id && dbUser.id !== decoded.id)) {
      res.status(403).json({
        success: false,
        error: 'User account is no longer authorized.',
      });
      return;
    }

    // Check account status
    if (dbUser.status === 'disabled') {
      res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact Superadmin.',
      });
      return;
    }

    // Check token version for immediate revocation upon disable or password reset
    if ((decoded.tokenVersion ?? 1) !== (dbUser.tokenVersion ?? 1)) {
      res.status(401).json({
        success: false,
        error: 'Session has been invalidated. Please log in again.',
      });
      return;
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      status: (dbUser.status as any) || 'active',
      permissions: dbUser.permissions || [],
      tokenVersion: dbUser.tokenVersion ?? 1,
    };

    next();
  } catch (err: any) {
    console.error('Authentication verification error:', err.message);
    res.status(500).json({ success: false, error: 'Database verification failed.' });
  }
}

/**
 * Server-side RBAC middleware for module permissions
 */
export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    // Superadmin has universal access
    if (req.user.role === 'superadmin') {
      next();
      return;
    }

    // Check explicit module permission
    const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    if (userPermissions.includes(permission) || userPermissions.includes('all')) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: `Access denied. You do not have permission to manage the '${permission}' module.`,
    });
  };
}

/** Grants access when the admin holds at least one of the given module permissions. */
export function requireAnyPermission(permissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    if (
      req.user.role === 'superadmin' ||
      userPermissions.includes('all') ||
      permissions.some((p) => userPermissions.includes(p))
    ) {
      next();
      return;
    }
    res.status(403).json({
      success: false,
      error: `Access denied. Requires one of these permissions: ${permissions.join(', ')}.`,
    });
  };
}

/**
 * Superadmin-only middleware
 */
export function requireSuperadmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'superadmin') {
    res.status(403).json({
      success: false,
      error: 'Superadmin privileges required to access this resource.',
    });
    return;
  }

  next();
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await getDatabaseAdapter().findUserByEmail(normalizedEmail);
  // Always run one bcrypt comparison so response time doesn't reveal whether the email exists.
  const isMatch = await bcrypt.compare(password, user?.passwordHash || DUMMY_PASSWORD_HASH);
  if (!user || !isMatch) {
    return { success: false, error: 'Invalid email or password.' };
  }

  // Only reveal the disabled state to someone who knows the password.
  if (user.status === 'disabled') {
    return { success: false, error: 'Your administrator account has been deactivated. Please contact Superadmin.' };
  }

  const payload: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: (user.status as any) || 'active',
    permissions: user.permissions || [],
    tokenVersion: user.tokenVersion ?? 1,
  };

  const token = generateToken(payload);

  // Update only last_login; rewriting the whole row could undo a concurrent disable/reset.
  try {
    await getDatabaseAdapter().updateLastLogin(user.id);
  } catch (err: any) {
    console.warn('Could not update last login timestamp:', err.message);
  }

  return {
    success: true,
    user: payload,
    token,
  };
}
