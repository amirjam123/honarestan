import type { Metadata } from "next";
import { generateSeoMetadata, generateLocalBusinessJsonLd, generateBreadcrumbJsonLd, generateWebPageJsonLd, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata("/contact");
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={generateWebPageJsonLd("/contact", "تماس با ما", "اطلاعات تماس هنرستان هادی. آدرس، تلفن و ایمیل برای ارتباط با ما.")} />
      <JsonLd data={generateLocalBusinessJsonLd()} />
      <JsonLd data={generateBreadcrumbJsonLd([
        { name: "صفحه اصلی", url: SITE_URL },
        { name: "تماس با ما", url: `${SITE_URL}/contact` },
      ])} />
      {children}
    </>
  );
}
