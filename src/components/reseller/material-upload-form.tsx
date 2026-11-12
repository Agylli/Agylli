"use client";
import {useRef,useState} from "react";
import {ActionForm} from "./action-form";
import {publishMaterial} from "@/app/equipe/actions";
import {prepareMaterialUpload,finalizeMaterialUpload} from "@/app/equipe/material-upload-actions";
import {getSupabaseClient} from "@/integrations/supabase/client";
import {transferMaterial,type CompletedMaterialUpload} from "@/lib/reseller/material-client";
import {materialCategories,resellerPortal} from "@/config/reseller";
import type {ActionState} from "@/lib/reseller/validation";

export function MaterialUploadForm(){
  const [phase,setPhase]=useState("");
  const uploaded=useRef<CompletedMaterialUpload|null>(null);
  async function publish(_:ActionState,form:FormData):Promise<ActionState>{
    return transferMaterial(form,uploaded,{
      prepare:prepareMaterialUpload,finalize:finalizeMaterialUpload,benefit:publishMaterial,phase:setPhase,
      upload:async(path,token,file,mime)=>{
        const client=getSupabaseClient();
        if(!client)return {error:"storage_not_configured"};
        return client.storage.from(resellerPortal.bucket).uploadToSignedUrl(path,token,file,{contentType:mime,upsert:false});
      },
    });
  }
  return <>
    {phase&&<p className="portal-message" role="status">{phase}</p>}
    <ActionForm action={publish} label="Publicar para revendedores" maxFileBytes={resellerPortal.catalogPdfLimitBytes}>
      <label htmlFor="material-title">Título<input id="material-title" name="title" minLength={3} maxLength={120} required /></label>
      <label htmlFor="material-category">Tipo de conteúdo<select id="material-category" name="category" defaultValue="catalogo">{Object.entries(materialCategories).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
      <label htmlFor="material-description">Descrição e condições<textarea id="material-description" name="description" rows={3} maxLength={1000} required /></label>
      <label htmlFor="material-file">Arquivo<input id="material-file" name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" /><span className="portal-hint">PDF até 50 MB. JPG, PNG ou WebP até 3 MB. Para benefício sem anexo, deixe o arquivo vazio.</span></label>
      <label className="portal-checkbox"><input name="authorized" type="checkbox" required /><span>Confirmo que o conteúdo, as condições comerciais e o uso do arquivo estão autorizados pela Agylli.</span></label>
    </ActionForm>
  </>;
}
