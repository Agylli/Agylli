import {materialFileSpec,materialMetadata} from "./material-upload";
import type {ActionState} from "./validation";
import type {UploadProgress} from "./resumable-upload";
export type CompletedMaterialUpload={path:string;name:string;size:number;modified:number};
export type MaterialTransfer={
 prepare:(spec:{mime:string;size:number})=>Promise<{path:string;token:string}|{error:string}>;
 upload:(path:string,token:string,file:File,mime:string)=>Promise<{error:unknown}>;
 finalize:(state:ActionState,form:FormData)=>Promise<ActionState>;
 benefit:(state:ActionState,form:FormData)=>Promise<ActionState>;
 phase:(message:string)=>void;
 progress?:(value:UploadProgress|null)=>void;
};
async function within<T>(work:Promise<T>,message:string):Promise<T>{
 let timer:ReturnType<typeof setTimeout>;
 try{return await Promise.race([work,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),45_000);})]);}
 finally{clearTimeout(timer!);}
}
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
   const prepared=await within(api.prepare({mime,size:file.size}),"Não foi possível preparar o envio em 45 segundos. Confira a conexão e sua sessão e tente novamente.");
   if("error" in prepared)return {error:prepared.error};
   api.phase(`Enviando ${Math.ceil(file.size/1024/1024)} MB ao armazenamento privado. Mantenha esta página aberta…`);
   api.progress?.({sent:0,total:file.size});
   const result=await api.upload(prepared.path,prepared.token,file,mime);
   if(result.error)return {error:typeof result.error==="string"?result.error:"O armazenamento recusou ou interrompeu o envio. Confira a conexão e se o limite de PDF foi atualizado no Supabase."};
   completed={path:prepared.path,name:file.name,size:file.size,modified:file.lastModified};cache.current=completed;
  }
  metadata.set("path",completed.path);api.progress?.(null);api.phase("Conferindo o arquivo e publicando o material…");
  const result=await within(api.finalize({},metadata),"O arquivo foi enviado, mas a confirmação demorou mais de 45 segundos. Confira a lista de materiais antes de tentar concluir a publicação novamente.");
  if(result.success)cache.current=null;
  return result;
 }catch(error){
  if(error instanceof Error && /^(Não foi possível preparar|O arquivo foi enviado, mas a confirmação)/.test(error.message))return {error:error.message};
  throw error;
 }finally{api.phase("");api.progress?.(null);}
}
