const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const db = new Database(path.join(__dirname, "..", "dev.db"));

// Simple password hash (sha256 for seed - production uses bcrypt)
function hashPassword(password) {
  // For seed, we use bcryptjs
  const bcrypt = require("bcryptjs");
  return bcrypt.hashSync(password, 10);
}

function generateId() {
  return crypto.randomBytes(12).toString("hex");
}

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const existingAdmin = db.prepare("SELECT id FROM AdminUser LIMIT 1").get();
  if (!existingAdmin) {
    const hash = hashPassword("admin123");
    db.prepare("INSERT INTO AdminUser (id, username, passwordHash, createdAt) VALUES (?, ?, ?, datetime('now'))")
      .run(generateId(), "admin", hash);
    console.log("Admin user created (admin / admin123)");
  }

  // Create default settings
  const settings = [
    ["school_name", "هنرستان فنی حرفه ای هادی"],
    ["hero_title", "هنرستان فنی حرفه ای هادی"],
    ["hero_subtitle", ""],
    ["address", "جاجرود، روستای خسروآباد، خیابان سد لتیان، کوچه بوستان"],
    ["phone", "02176201350"],
    ["email", "HonarestanHadi@gmail.com"],
  ];

  const upsertSetting = db.prepare(
    "INSERT OR REPLACE INTO SiteSetting (id, key, value) VALUES (?, ?, ?)"
  );

  for (const [key, value] of settings) {
    const existing = db.prepare("SELECT id FROM SiteSetting WHERE key = ?").get(key);
    if (existing) {
      db.prepare("UPDATE SiteSetting SET value = ? WHERE key = ?").run(value, key);
    } else {
      upsertSetting.run(generateId(), key, value);
    }
  }
  console.log("Default settings created");

  // Create about page
  const existingPage = db.prepare("SELECT id FROM Page WHERE slug = ?").get("about");
  if (!existingPage) {
    db.prepare(
      "INSERT INTO Page (id, slug, title, content, updatedAt) VALUES (?, ?, ?, ?, datetime('now'))"
    ).run(
      generateId(),
      "about",
      "درباره ما",
      "## درباره هنرستان فنی حرفه ای هادی\n\nهنرستان فنی حرفه ای هادی در رشته‌های حسابداری و شبکه و نرم‌افزار دانش‌آموز پذیرش می‌کند.\n\n### رشته‌های آموزشی\n\n- **حسابداری**\n- **شبکه و نرم‌افزار**"
    );
    console.log("About page created");
  }

  db.close();
  console.log("Seeding completed!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
