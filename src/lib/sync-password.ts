import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

const PROJECT_ROOT = resolve(process.cwd());

const FILES_TO_SYNC = [
  "CLAUDE.md",
  "prisma/seed.ts",
  "src/app/hadi-panel-x7k9/setup/page.tsx",
  "PROJECT-DOCS.md",
  "ADMIN-MANUAL.md",
  "PROJECT-OVERVIEW.md",
  "SEO-FINAL-AUDIT-REPORT.md",
  "README.mdc",
];

/**
 * Syncs the admin password across all project files that reference it.
 * Updates documentation, seed file, and setup wizard display.
 */
export async function syncPasswordInFiles(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  if (!oldPassword || !newPassword || oldPassword === newPassword) return;

  const bt = "`";

  const replacements = [
    // CLAUDE.md, PROJECT-DOCS.md, PROJECT-OVERVIEW.md: `honarestan` / `OLD`
    { from: "honarestan" + " / " + bt + oldPassword + bt, to: "honarestan" + " / " + bt + newPassword + bt },
    // seed.ts: bcrypt.hash("OLD", 12)
    { from: 'bcrypt.hash("' + oldPassword + '", 12)', to: 'bcrypt.hash("' + newPassword + '", 12)' },
    // seed.ts: console.log
    { from: "Admin user created (honarestan / " + oldPassword + ")", to: "Admin user created (honarestan / " + newPassword + ")" },
    // setup/page.tsx: >OLD</code>
    { from: ">" + oldPassword + "</code>", to: ">" + newPassword + "</code>" },
    // ADMIN-MANUAL.md: Password: `OLD`
    { from: "Password: " + bt + oldPassword + bt, to: "Password: " + bt + newPassword + bt },
    // PROJECT-OVERVIEW.md: Password `OLD` (set in seed.ts)
    { from: "Password " + bt + oldPassword + bt + " (set in seed.ts)", to: "Password " + bt + newPassword + bt + " (set in seed.ts)" },
    // SEO-FINAL-AUDIT-REPORT.md: from `OLD`
    { from: "from " + bt + oldPassword + bt, to: "from " + bt + newPassword + bt },
    // README.mdc: Password: `OLD`
    { from: "Password: " + bt + oldPassword + bt, to: "Password: " + bt + newPassword + bt },
  ];

  for (const file of FILES_TO_SYNC) {
    try {
      const filePath = resolve(PROJECT_ROOT, file);
      let content = await readFile(filePath, "utf-8");
      let changed = false;

      for (const { from, to } of replacements) {
        if (content.includes(from)) {
          content = content.replaceAll(from, to);
          changed = true;
        }
      }

      if (changed) {
        await writeFile(filePath, content, "utf-8");
      }
    } catch {
      // File may not exist (e.g. README.mdc), skip silently
    }
  }
}
