"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requirePortal } from "@/lib/reseller/session";
import { materialFileSpec,materialMetadata,materialPathMime } from "@/lib/reseller/material-upload";
import { resellerPortal } from "@/config/reseller";
import { textField,UUID_PATTERN,type ActionState } from "@/lib/reseller/validation";
import { validateStoredMaterial } from "@/lib/reseller/material-file-server";

export async function prepareMaterialUpload(spec: {mime:string;size:number}):Promise<{path:string;token:string}|{error:string}> {
  const {db}=await requirePortal(true);
  let checked:ReturnType<typeof materialFileSpec>;
  try { checked=materialFileSpec(spec.mime,spec.size); } catch(error) {return {error:error instanceof Error?error.message:"Arquivo inválido."};}
  const path=`${randomUUID()}.${checked.extension}`;
  const result=await db.storage.from(resellerPortal.bucket).createSignedUploadUrl(path,{upsert:false});
  if(result.error||!result.data) return {error:"Não foi possível preparar o envio privado. Confira sua sessão e tente novamente."};
  return {path:result.data.path,token:result.data.token};
}

export async function finalizeMaterialUpload(_:ActionState,form:FormData):Promise<ActionState> {
  const {db}=await requirePortal(true),path=textField(form,"path"),mime=materialPathMime(path);
  if(!mime)return {error:"Referência do arquivo inválida. Selecione o arquivo novamente."};
  let metadata:ReturnType<typeof materialMetadata>;
  try{metadata=materialMetadata(form);}catch(error){return {error:error instanceof Error?error.message:"Confira os dados."};}
  const existing=await db.from("reseller_resources").select("id").eq("file_path",path).maybeSingle();
  if(existing.error)return {error:"Não foi possível conferir a publicação. Tente novamente."};
  if(existing.data)return {success:"Esse arquivo já está cadastrado. Confira o material no painel."};
  const fileError=await validateStoredMaterial(db,path);
  if(fileError)return {error:fileError};
  const coverPath=textField(form,"cover_path");
  if(coverPath){const coverError=await validateStoredMaterial(db,coverPath,true);if(coverError)return {error:coverError};}
  const saved=await db.from("reseller_resources").insert({...metadata,file_path:path,cover_path:coverPath||null}).select("id").single();
  if(saved.error||!saved.data){
    // A retry can race with the same successful publication; never duplicate it.
    const duplicate=await db.from("reseller_resources").select("id").eq("file_path",path).maybeSingle();
    if(!duplicate.data)return {error:"O arquivo foi enviado, mas a publicação não foi concluída. Tente publicar novamente."};
  }
  revalidatePath("/equipe");revalidatePath("/revendedor");
  return {success:"Material publicado para os revendedores aprovados."};
}

export async function updateMaterialCover(_:ActionState,form:FormData):Promise<ActionState> {
  const {db}=await requirePortal(true),id=textField(form,"id"),path=textField(form,"cover_path");
  if(!UUID_PATTERN.test(id)||form.get("authorized")!=="on")return {error:"Confira o material e confirme a autorização da imagem."};
  if(!path)return {error:"Selecione uma imagem para a capa."};
  const checked=await validateStoredMaterial(db,path,true);
  if(checked)return {error:checked};
  const result=await db.from("reseller_resources").update({cover_path:path}).eq("id",id).select("id").maybeSingle();
  if(result.error||!result.data)return {error:"Não foi possível salvar a capa. O PDF foi preservado; tente novamente."};
  revalidatePath("/equipe");revalidatePath("/revendedor");
  return {success:"Capa do material atualizada."};
}
