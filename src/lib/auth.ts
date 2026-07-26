import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
  console.error("WARNING: JWT_SECRET environment variable is not set. Using fallback (NOT SECURE FOR PRODUCTION).");
}

export interface AdminPayload {
  userId: string;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "8h" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    return decoded as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  console.log("[auth] all cookies:", allCookies.map(c => c.name));
  const token = cookieStore.get("admin_token")?.value;
  console.log("[auth] admin_token present:", !!token);
  if (!token) return null;
  const result = verifyToken(token);
  console.log("[auth] verifyToken result:", result ? result.username : "null");
  return result;
}

export async function requireAdmin(): Promise<AdminPayload> {
  const admin = await getAdminFromRequest();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<string | null> {
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return generateToken({ userId: user.id, username: user.username });
}
