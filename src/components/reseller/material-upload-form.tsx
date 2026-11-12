"use client";
import {useEffect,useRef,useState} from "react";
import {ActionForm} from "./action-form";
import {publishMaterial} from "@/app/equipe/actions";
import {prepareMaterialUpload,finalizeMaterialUpload} from "@/app/equipe/material-upload-actions";
import {supabaseSettings} from "@/integrations/supabase/settings";
import {uploadMaterialFile,type UploadProgress} from "@/lib/reseller/resumable-upload";
import {transferMaterial,type CompletedMaterialUpload} from "@/lib/reseller/material-client";
import {materialCategories,resellerPortal} from "@/config/reseller";
import type {ActionState} from "@/lib/reseller/validation";

export function MaterialUploadForm(){
  const [phase,setPhase]=useState("");
  const [progress,setProgress]=useState<UploadProgress|null>(null);
  const controller=useRef<AbortController|null>(null);
  useEffect(()=>()=>controller.current?.abort(),[]);
  const uploaded=useRef<CompletedMaterialUpload|null>(null);
  async function publish(_:ActionState,form:FormData):Promise<ActionState>{
    controller.current=new AbortController();
    return transferMaterial(form,uploaded,{
      prepare:prepareMaterialUpload,finalize:finalizeMaterialUpload,benefit:publishMaterial,phase:setPhase,progress:setProgress,
      upload:async(path,token,file,mime)=>{
        const settings=supabaseSettings();
        if(!settings)return {error:"O armazenamento não está configurado. Fale com a equipe."};
        return uploadMaterialFile({...settings,path,token,file,mime,signal:controller.current!.signal,progress:setProgress});
      },
    });
  }
  return <>
    {phase&&<p className="portal-message" role="status">{phase}</p>}
    {progress&&<MaterialUploadProgress value={progress} onCancel={()=>controller.current?.abort()} />}
    <ActionForm action={publish} label="Publicar para revendedores" maxFileBytes={resellerPortal.catalogPdfLimitBytes} preserveOnError>
      <label htmlFor="material-title">Título<input id="material-title" name="title" minLength={3} maxLength={120} required /></label>
      <label htmlFor="material-category">Tipo de conteúdo<select id="material-category" name="category" defaultValue="catalogo">{Object.entries(materialCategories).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
      <label htmlFor="material-description">Descrição e condições<textarea id="material-description" name="description" rows={3} maxLength={1000} required /></label>
      <label htmlFor="material-file">Arquivo<input id="material-file" name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" /><span className="portal-hint">PDF até {resellerPortal.catalogPdfLimitBytes/1024/1024} MB. JPG, PNG ou WebP até 3 MB. Para benefício sem anexo, deixe o arquivo vazio.</span></label>
      <label className="portal-checkbox"><input name="authorized" type="checkbox" required /><span>Confirmo que o conteúdo, as condições comerciais e o uso do arquivo estão autorizados pela Agylli.</span></label>
    </ActionForm>
  </>;
}

export function MaterialUploadProgress({value,onCancel}:{value:UploadProgress;onCancel:()=>void}){
  return <div className="portal-upload-progress">
    <label htmlFor="material-progress">Enviando arquivo: {Math.floor(value.sent/Math.max(value.total,1)*100)}%</label>
    <progress id="material-progress" max={value.total} value={value.sent} />
    <p>{(value.sent/1024/1024).toFixed(1)} de {(value.total/1024/1024).toFixed(1)} MB. Após o envio, aguarde a confirmação da publicação.</p>
    <button className="button button-secondary" type="button" onClick={onCancel}>Cancelar envio</button>
  </div>;
}
