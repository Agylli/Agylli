"use client";
import { useEffect, useRef, useState } from "react";
import { ActionForm } from "./action-form";
import { prepareMaterialUpload, updateMaterialCover } from "@/app/equipe/material-upload-actions";
import { transferMaterialCover } from "@/lib/reseller/material-cover-client";
import type { CompletedMaterialUpload } from "@/lib/reseller/material-client";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { uploadMaterialFile } from "@/lib/reseller/resumable-upload";
import type { ActionState } from "@/lib/reseller/validation";

export function MaterialCoverForm({ id }: { id: string }) {
  const cache = useRef<CompletedMaterialUpload | null>(null), controller = useRef<AbortController | null>(null);
  const [phase, setPhase] = useState("");
  useEffect(() => () => controller.current?.abort(), []);
  async function save(_: ActionState, form: FormData): Promise<ActionState> {
    if (form.get("authorized") !== "on") return { error: "Confirme a autorização de uso da capa." };
    controller.current = new AbortController();
    try {
      const cover = await transferMaterialCover(form, cache, {
        prepare: prepareMaterialUpload, phase: setPhase,
        upload: async (path, token, file, mime) => {
          const settings = supabaseSettings();
          if (!settings) return { error: "Armazenamento não configurado." };
          return uploadMaterialFile({ ...settings, path, token, file, mime, signal: controller.current!.signal, progress: () => {} });
        },
      });
      if ("error" in cover) return cover;
      if (!cover.path) return { error: "Selecione uma imagem para a capa." };
      const metadata = new FormData(); metadata.set("id", id); metadata.set("cover_path", cover.path); metadata.set("authorized", "on");
      const result = await updateMaterialCover({}, metadata);
      if (result.success) cache.current = null;
      return result;
    } finally { setPhase(""); }
  }
  return <details className="portal-cover-editor"><summary>Adicionar ou trocar capa</summary>{phase && <p role="status">{phase}</p>}<ActionForm action={save} label="Salvar capa" maxFileBytes={3 * 1024 * 1024} preserveOnError><label htmlFor={`cover-${id}`}>Foto de capa<input id={`cover-${id}`} name="cover" type="file" accept="image/jpeg,image/png,image/webp" required /><span className="portal-hint">JPG, PNG ou WebP até 3 MB. O PDF não será alterado.</span></label><label className="portal-checkbox"><input name="authorized" type="checkbox" required /><span>Confirmo a autorização de uso desta imagem.</span></label></ActionForm></details>;
}
