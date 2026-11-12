"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requirePortal } from "@/lib/reseller/session";
import { materialFileSpec,materialMetadata,materialPathMime } from "@/lib/reseller/material-upload";
import { resellerPortal } from "@/config/reseller";
import { textField,validMaterial,type ActionState } from "@/lib/reseller/validation";
import { supabaseSettings } from "@/integrations/supabase/settings";

export async function prepareMaterialUpload(spec: {mime:string;size:number}):Promise<{path:string;token:string}|{error:string}> {
  const {db}=await requirePortal(true);
  let checked:ReturnType<typeof materialFileSpec>;
  try { checked=materialFileSpec(spec.mime,spec.size); } catch(error) {return {error:error instanceof Error?error.message:"Arquivo inválido."};}
  const path=`${randomUUID()}.${checked.extension}`;
  const result=await db.storage.from(resellerPortal.bucket).createSignedUploadUrl(path,{upsert:false});
  if(result.error||!result.data) return {error:"Não foi possível preparar o envio privado. Confira sua sessão e tente novamente."};
  return {path:result.data.path,token:result.data.token};
}

async function firstBytes(url:string) {
  const response=await fetch(url,{headers:{Range:"bytes=0-15"},cache:"no-store",redirect:"error"});
  if(!response.ok||!response.body)throw new Error("file_header_unavailable");
  const reader=response.body.getReader(),bytes=new Uint8Array(16);let length=0;
  try {
    while(length<16){const part=await reader.read();if(part.done)break;const take=Math.min(part.value.length,16-length);bytes.set(part.value.subarray(0,take),length);length+=take;}
  } finally {try{await reader.cancel();}catch{/* Stream may already be closed. */}}
  return bytes.subarray(0,length);
}

export async function finalizeMaterialUpload(_:ActionState,form:FormData):Promise<ActionState> {
  const {db}=await requirePortal(true),path=textField(form,"path"),mime=materialPathMime(path);
  if(!mime)return {error:"Referência do arquivo inválida. Selecione o arquivo novamente."};
  let metadata:ReturnType<typeof materialMetadata>;
  try{metadata=materialMetadata(form);}catch(error){return {error:error instanceof Error?error.message:"Confira os dados."};}
  const existing=await db.from("reseller_resources").select("id").eq("file_path",path).maybeSingle();
  if(existing.error)return {error:"Não foi possível conferir a publicação. Tente novamente."};
  if(existing.data)return {success:"Esse arquivo já está cadastrado. Confira o material no painel."};
  const bucket=db.storage.from(resellerPortal.bucket);
  const info=await bucket.info(path);
  if(info.error||!info.data)return {error:"O arquivo ainda não chegou ao armazenamento. Tente concluir o envio novamente."};
  const actualMime=info.data.contentType?.split(";")[0].toLowerCase();
  try {
    if(actualMime!==mime)throw new Error("O tipo do arquivo não corresponde ao material enviado.");
    materialFileSpec(actualMime,Number(info.data.size));
  }catch(error){await bucket.remove([path]);return {error:error instanceof Error?error.message:"Arquivo inválido."};}
  const signed=await bucket.createSignedUrl(path,60),settings=supabaseSettings();
  if(signed.error||!signed.data||!settings)return {error:"Não foi possível validar o arquivo. Tente publicar novamente."};
  try {
    if(new URL(signed.data.signedUrl).origin!==new URL(settings.url).origin)throw new Error("invalid_storage_origin");
    if(!validMaterial(await firstBytes(signed.data.signedUrl),mime)) {
      await bucket.remove([path]);return {error:"O conteúdo não corresponde a um PDF ou imagem válida."};
    }
  }catch{return {error:"Não foi possível conferir o conteúdo do arquivo. Tente publicar novamente."};}
  const saved=await db.from("reseller_resources").insert({...metadata,file_path:path}).select("id").single();
  if(saved.error||!saved.data){
    // A retry can race with the same successful publication; never duplicate it.
    const duplicate=await db.from("reseller_resources").select("id").eq("file_path",path).maybeSingle();
    if(!duplicate.data)return {error:"O arquivo foi enviado, mas a publicação não foi concluída. Tente publicar novamente."};
  }
  revalidatePath("/equipe");revalidatePath("/revendedor");
  return {success:"Material publicado para os revendedores aprovados."};
}
