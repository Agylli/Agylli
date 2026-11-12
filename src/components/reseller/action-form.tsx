"use client";
import { useActionState, useRef, type ReactNode } from "react";
import type { ActionState } from "@/lib/reseller/validation";
import { guardedFileAction } from "@/lib/reseller/forms";
export function ActionForm({
  action,
  children,
  label,
  enabled = true,
  className = "",
  maxFileBytes,
  preserveOnError = false,
}: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  children: ReactNode;
  label: string;
  enabled?: boolean;
  className?: string;
  maxFileBytes?: number;
  preserveOnError?: boolean;
}) {
  const allowReset = useRef(false);
  const guarded = maxFileBytes ? guardedFileAction(action,maxFileBytes) : action;
  const [state, formAction, pending] = useActionState(preserveOnError ? async(previous:ActionState,form:FormData)=>{
    const result=await guarded(previous,form);allowReset.current=!!result.success;return result;
  } : guarded, {});
  return (
    <form action={formAction} className={`portal-form ${className}`} onReset={preserveOnError ? event=>{if(!allowReset.current)event.preventDefault();} : undefined}>
      {state.error && (
        <p className="portal-message error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="portal-message" role="status">
          {state.success}
        </p>
      )}
      <fieldset disabled={!enabled || pending}>
        {children}
        <button className="button button-primary" type="submit">
          {pending ? "Aguarde…" : label}
        </button>
      </fieldset>
    </form>
  );
}
