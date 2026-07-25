import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata("/contact");
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
