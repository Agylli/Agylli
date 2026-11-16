"use client";
import Image from "next/image";
import { useState } from "react";
import { FileText } from "lucide-react";
export function MaterialCover({ src, title }: { src?: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="portal-material-cover">{src && !failed ? <Image src={src} alt={`Capa de ${title}`} fill sizes="(max-width:767px) 90vw, 420px" unoptimized onError={() => setFailed(true)} /> : <span><FileText size={42} aria-hidden="true" /><span>Material de apoio</span></span>}</div>;
}
