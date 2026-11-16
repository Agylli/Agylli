"use client";
import { useState } from "react";
import { MaterialCover } from "./material-cover";

export function MaterialMedia({ videoUrl, coverUrl, title }: { videoUrl?: string | null; coverUrl?: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  if (!videoUrl) return <MaterialCover src={coverUrl} title={title} />;
  return <div className="portal-material-video"><video controls playsInline preload="metadata" poster={coverUrl ?? undefined} aria-label={`Vídeo: ${title}`} onError={() => setFailed(true)} src={videoUrl}>Seu navegador não reproduz este vídeo. Use o link para baixar o material.</video>{failed && <p role="status">Não foi possível reproduzir aqui. Atualize a página ou use “Baixar material” para abrir o vídeo no seu dispositivo.</p>}</div>;
}
