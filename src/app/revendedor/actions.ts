"use server";
import { cookies } from "next/headers";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { redirect } from "next/navigation";
import { serverSupabase } from "@/integrations/supabase/server";
import { portalOrigin } from "@/lib/reseller/origin";
import { emailAddress } from "@/lib/urls";
import {
  safePortalNext,
  signupInput,
  textField,
  validPassword,
  type ActionState,
} from "@/lib/reseller/validation";

const unavailable: ActionState = {
  error:
    "O acesso online está em preparação. Fale com sua unidade de atendimento.",
};
export async function signIn(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const db = await serverSupabase();
  if (!db) return unavailable;
  const email = emailAddress(textField(form, "email")),
    password = form.get("password");
  if (!email || typeof password !== "string" || password.length > 128)
    return { error: "Confira seu e-mail e sua senha." };
  try {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error)
      return {
        error:
          "Não foi possível entrar. Confira seus dados e a confirmação do e-mail.",
      };
  } catch {
    return {
      error: "Não foi possível conectar agora. Tente novamente em instantes.",
    };
  }
  redirect(safePortalNext(textField(form, "next")));
}
export async function signUp(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const db = await serverSupabase(),
    origin = portalOrigin();
  if (!db || !origin) return unavailable;
  let input: ReturnType<typeof signupInput>;
  try {
    input = signupInput(form);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Revise os dados do cadastro.",
    };
  }
  try {
    const { error } = await db.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          portal: "agylli-reseller",
          name: input.name,
          phone: input.phone,
          unit: input.unit,
        },
      },
    });
    if (error)
      return {
        error:
          "Não foi possível concluir. Tente novamente ou use a recuperação de acesso se já tiver cadastro.",
      };
  } catch {
    return {
      error: "Não foi possível conectar agora. Tente novamente em instantes.",
    };
  }
  return {
    success:
      "Confira seu e-mail para confirmar o acesso. Depois, a equipe analisará seu cadastro antes de liberar pedidos e materiais.",
  };
}
export async function signOut() {
  const db = await serverSupabase();
  try {
    if (db) await db.auth.signOut({ scope: "local" });
  } catch {
    /* Clear this browser session even during provider unavailability. */
  }
  const settings = supabaseSettings();
  if (settings) {
    const prefix = `sb-${new URL(settings.url).hostname.split(".")[0]}-auth-token`;
    const store = await cookies();
    for (const cookie of store.getAll())
      if (
        cookie.name === prefix ||
        cookie.name.startsWith(`${prefix}.`) ||
        cookie.name.startsWith(`${prefix}-`)
      )
        store.delete(cookie.name);
  }
  redirect("/revendedor/entrar");
}
export async function resendConfirmation(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const db = await serverSupabase(), origin = portalOrigin();
  if (!db || !origin) return unavailable;
  const email = emailAddress(textField(form, "email"));
  if (!email) return { error: "Informe um e-mail válido." };
  try {
    await db.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
  } catch {
    // Same response for missing/confirmed accounts and provider limits/outages.
  }
  return {
    success: "Se houver um cadastro aguardando confirmação, você receberá um novo e-mail. Aguarde alguns instantes e confira também o spam. Se já confirmou, entre com sua senha.",
  };
}
export async function recoverPassword(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const db = await serverSupabase(),
    origin = portalOrigin(),
    email = emailAddress(textField(form, "email"));
  if (!db || !origin) return unavailable;
  if (!email) return { error: "Informe um e-mail válido." };
  try {
    await db.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/revendedor/redefinir-senha`,
    });
  } catch {
    /* Keep recovery responses generic, including provider outages. */
  }
  return {
    success:
      "Se houver um cadastro com esse endereço, você receberá as instruções de recuperação.",
  };
}
export async function resetPassword(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const db = await serverSupabase();
  if (!db) return unavailable;
  const { data } = await db.auth.getUser();
  if (!data.user)
    return {
      error: "Abra o link de recuperação recebido por e-mail para continuar.",
    };
  const password =
    typeof form.get("password") === "string"
      ? String(form.get("password"))
      : "";
  if (!validPassword(password) || password !== form.get("passwordConfirmation"))
    return { error: "Use de 12 a 128 caracteres e repita a mesma senha." };
  const { error } = await db.auth.updateUser({ password });
  if (error)
    return {
      error:
        "Não foi possível alterar a senha. Solicite um novo link de recuperação.",
    };
  redirect("/revendedor?notice=password-updated");
}
