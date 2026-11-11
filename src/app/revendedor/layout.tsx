import type { Metadata } from "next";
import "@/components/reseller/portal.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Área do revendedor",
  robots: { index: false, follow: false },
  referrer: "same-origin",
};
export default function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
