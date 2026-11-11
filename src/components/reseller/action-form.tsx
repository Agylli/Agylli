"use client";
import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/lib/reseller/validation";
export function ActionForm({
  action,
  children,
  label,
  enabled = true,
  className = "",
}: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  children: ReactNode;
  label: string;
  enabled?: boolean;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={`portal-form ${className}`}>
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
