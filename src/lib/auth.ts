import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "honarestan-hadi-default-secret";

export interface AdminPayload {
  userId: string;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<AdminPayload> {
  const admin = await getAdminFromRequest();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}

export async function initAdmin() {
  const existing = await prisma.adminUser.findFirst();
  if (!existing) {
    const hash = await hashPassword("admin123");
    await prisma.adminUser.create({
      data: {
        username: "admin",
        passwordHash: hash,
      },
    });
    console.log("Default admin created: admin / admin123");
  }
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
