-- CreateTable
CREATE TABLE "SchoolProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "overview" TEXT NOT NULL DEFAULT '',
    "history" TEXT NOT NULL DEFAULT '',
    "vision" TEXT NOT NULL DEFAULT '',
    "mission" TEXT NOT NULL DEFAULT '',
    "educationalGoals" TEXT NOT NULL DEFAULT '',
    "departments" TEXT NOT NULL DEFAULT '',
    "facilities" TEXT NOT NULL DEFAULT '',
    "statistics" TEXT NOT NULL DEFAULT '{}',
    "galleryImages" TEXT NOT NULL DEFAULT '[]',
    "additionalInfo" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PrincipalProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "photo" TEXT,
    "position" TEXT NOT NULL DEFAULT '',
    "biography" TEXT NOT NULL DEFAULT '',
    "welcomeMessage" TEXT NOT NULL DEFAULT '',
    "resume" TEXT NOT NULL DEFAULT '',
    "achievements" TEXT NOT NULL DEFAULT '[]',
    "contactInfo" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
