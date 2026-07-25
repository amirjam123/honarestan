-- CreateTable
CREATE TABLE "SeoSetting" (
    "id" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "canonicalUrl" TEXT,
    "robots" TEXT NOT NULL DEFAULT 'index, follow',
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "ogType" TEXT NOT NULL DEFAULT 'website',
    "twitterCard" TEXT NOT NULL DEFAULT 'summary_large_image',
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImage" TEXT,
    "jsonLd" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeoSetting_pagePath_key" ON "SeoSetting"("pagePath");
