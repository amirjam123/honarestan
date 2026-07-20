// Admin panel secret path configuration
// Change ADMIN_SECRET_PATH in .env to customize the admin URL
// Default: hadi-panel-x7k9

export const ADMIN_SECRET_PATH = process.env.ADMIN_SECRET_PATH || "hadi-panel-x7k9";

export function getAdminPath(path: string = ""): string {
  return `/${ADMIN_SECRET_PATH}${path}`;
}
