import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { ADMIN_SECRET_PATH } from "@/lib/admin-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [`/${ADMIN_SECRET_PATH}`, `/${ADMIN_SECRET_PATH}/`, "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
