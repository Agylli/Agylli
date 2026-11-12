import {materialFileSpec,materialMetadata} from "./material-upload";
import type {ActionState} from "./validation";
export type CompletedMaterialUpload={path:string;name:string;size:number;modified:number};
export type MaterialTransfer={
 prepare:(spec:{mime:string;size:number})=>Promise<{path:string;token:string}|{error:string}>;
 upload:(path:string,token:string,file:File,mime:string)=>Promise<{error:unknown}>;
 finalize:(state:ActionState,form:FormData)=>Promise<ActionState>;
 benefit:(state:ActionState,form:FormData)=>Promise<ActionState>;
 phase:(message:string)=>void;
};
/** Only the Storage adapter receives bytes; server actions receive small metadata. */
export async function transferMaterial(form:FormData,cache:{current:CompletedMaterialUpload|null},api:MaterialTransfer):Promise<ActionState>{
 const metadata=new FormData();for(const field of ["title","description","category","authorized"])metadata.set(field,String(form.get(field)??""));
 try{materialMetadata(metadata);}catch(error){return {error:error instanceof Error?error.message:"Confira os dados."};}
 const file=form.get("file");
 if(!(file instanceof File)||!file.size){
  if(metadata.get("category")!=="beneficio")return {error:"Selecione o PDF ou a imagem do material."};
  return api.benefit({},metadata);
 }
 const mime=file.type||(/\.pdf$/i.test(file.name)?"application/pdf":"");
 try{materialFileSpec(mime,file.size);}catch(error){return {error:error instanceof Error?error.message:"Arquivo inválido."};}
 try{
  let completed=cache.current;
  if(!completed||completed.name!==file.name||completed.size!==file.size||completed.modified!==file.lastModified){
   api.phase("Preparando envio privado…");
   const prepared=await api.prepare({mime,size:file.size});
   if("error" in prepared)return {error:prepared.error};
   api.phase(`Enviando ${Math.ceil(file.size/1024/1024)} MB ao armazenamento privado. Mantenha esta página aberta…`);
   const result=await api.upload(prepared.path,prepared.token,file,mime);
   if(result.error)return {error:"O armazenamento recusou ou interrompeu o envio. Confira a conexão e se o limite de PDF foi atualizado no Supabase."};
   completed={path:prepared.path,name:file.name,size:file.size,modified:file.lastModified};cache.current=completed;
  }
  metadata.set("path",completed.path);api.phase("Conferindo o arquivo e publicando o material…");
  const result=await api.finalize({},metadata);
  if(result.success)cache.current=null;
  return result;
 }finally{api.phase("");}
}
