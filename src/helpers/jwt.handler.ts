import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const DEFAULT_SIGN_OPTION: jwt.SignOptions = {
  expiresIn: process.env.JWT_EXPIRE as jwt.SignOptions["expiresIn"],
};

interface JwtPayload {
  id: number;
  company: string;
  email: string;
  phone: string;
  nip: string;
  country: string;
  city: string;
  address: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export function generateToken(id: string) {
  const secret_key = process.env.JWT_SECRET;

  if (!secret_key) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign(id, secret_key, DEFAULT_SIGN_OPTION);

  return token;
}

export function verifyJwt(token: string): JwtPayload | null {
  const secret_key = process.env.JWT_SECRET;

  if (!secret_key) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    const decoded = jwt.verify(token, secret_key) as JwtPayload;
    return decoded;
  } catch {
    console.error("JWT Verification Failed");
    return null;
  }
}

interface AuthGuardResult {
  success: boolean;
  userId?: number;
  role?: Role;
  error?: string;
}

export function authGuard(
  path: string,
  token: string | null,
  role?: Role | Role[]
): AuthGuardResult {
  if (!token) {
    console.error(`JwtError: Auth Guard Error - ${path}`);
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const verifiedToken = verifyJwt(token);

  if (!verifiedToken) {
    console.error(`JwtError: Auth Guard Error - ${path}`);
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(verifiedToken.role)) {
        console.error(`JwtError: Auth Guard Error - ${path}`);
        return {
          success: false,
          error: "Unauthorized",
        };
      }
    } else {
      if (verifiedToken.role !== role) {
        console.error(`JwtError: Auth Guard Error - ${path}`);
        return {
          success: false,
          error: "Unauthorized",
        };
      }
    }
  }

  return {
    success: true,
    userId: verifiedToken.id,
    role: verifiedToken.role,
  };
}
