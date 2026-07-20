import { prisma } from "./prisma";

export type SecurityEvent = 
  | "login_success"
  | "login_failed"
  | "logout"
  | "password_change"
  | "admin_action"
  | "unauthorized_access"
  | "rate_limit_hit"
  | "file_upload"
  | "record_create"
  | "record_update"
  | "record_delete";

interface LogEntry {
  event: SecurityEvent;
  ip: string;
  username?: string;
  details?: string;
  path?: string;
}

export async function logSecurityEvent(entry: LogEntry): Promise<void> {
  try {
    // Log to console for immediate visibility
    const timestamp = new Date().toISOString();
    const logMessage = `[SECURITY] ${timestamp} | ${entry.event} | IP: ${entry.ip} | User: ${entry.username || "anonymous"} | ${entry.details || ""} | Path: ${entry.path || ""}`;
    
    console.log(logMessage);

    // Store in database
    await prisma.securityLog.create({
      data: {
        event: entry.event,
        ip: entry.ip,
        username: entry.username || null,
        details: entry.details || null,
        path: entry.path || null,
      },
    });
    
  } catch (error) {
    // Don't let logging failures affect the main application
    console.error("Failed to log security event:", error);
  }
}

export async function logLoginAttempt(ip: string, username: string, success: boolean): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        ip,
        username,
        success,
      },
    });
  } catch (error) {
    console.error("Failed to log login attempt:", error);
  }
}

export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         request.headers.get("x-real-ip") || 
         "unknown";
}
