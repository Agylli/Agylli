import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function ActionLink({ href, children, variant = "primary", className = "" }: {
  href: string; children: ReactNode; variant?: "primary" | "secondary" | "light" | "text"; className?: string;
}) {
  return <Link href={href} className={`button button-${variant} ${className}`}>
    <span>{children}</span><ArrowUpRight size={18} aria-hidden="true" />
  </Link>;
}
