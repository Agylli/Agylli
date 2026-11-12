import type { ActionState } from "./validation";
export type FormAction = (state: ActionState, form: FormData) => Promise<ActionState>;
export function guardedFileAction(action: FormAction, maxBytes: number): FormAction {
  return async (state, form) => {
    for (const value of form.values()) {
      if (value instanceof File && value.size > maxBytes)
        return { error: `O arquivo ultrapassa o limite de ${Math.floor(maxBytes / 1024 / 1024)} MB. Selecione um arquivo menor.` };
    }
    try { return await action(state, form); }
    catch(error) {
      // Navigation signals must reach Next.js instead of becoming form errors.
      if (error && typeof error === "object" && "digest" in error && typeof error.digest === "string" && /^(NEXT_REDIRECT|NEXT_HTTP_ERROR_FALLBACK);/.test(error.digest)) throw error;
      return { error: "Não foi possível concluir o envio. Confira a conexão, atualize a página e tente novamente." };
    }
  };
}
