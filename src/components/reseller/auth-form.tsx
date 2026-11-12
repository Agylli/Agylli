"use client";
import { ActionForm } from "./action-form";
import {
  signIn,
  signUp,
  recoverPassword,
  resetPassword,
  resendConfirmation,
} from "@/app/revendedor/actions";
import { locations } from "@/config/locations";
export type AuthScreen =
  "entrar" | "cadastro" | "recuperar-senha" | "redefinir-senha" | "reenviar-confirmacao";
export function AuthForm({
  screen,
  enabled,
  next,
}: {
  screen: AuthScreen;
  enabled: boolean;
  next: string;
}) {
  const action =
    screen === "cadastro"
      ? signUp
      : screen === "reenviar-confirmacao"
        ? resendConfirmation
        : screen === "recuperar-senha"
          ? recoverPassword
          : screen === "redefinir-senha"
            ? resetPassword
            : signIn;
  const label =
    screen === "cadastro"
      ? "Solicitar cadastro"
      : screen === "reenviar-confirmacao"
        ? "Reenviar confirmação"
        : screen === "recuperar-senha"
          ? "Enviar instruções"
          : screen === "redefinir-senha"
            ? "Salvar nova senha"
            : "Entrar na minha área";
  return (
    <ActionForm action={action} label={label} enabled={enabled}>
      <input name="next" type="hidden" value={next} />
      {screen === "cadastro" && (
        <label htmlFor="reseller-name">
          Nome completo
          <input
            id="reseller-name"
            name="name"
            autoComplete="name"
            minLength={3}
            maxLength={100}
            required
          />
        </label>
      )}
      {screen !== "redefinir-senha" && (
        <label htmlFor="reseller-email">
          E-mail
          <input
            id="reseller-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </label>
      )}
      {(screen === "entrar" || screen === "cadastro" || screen === "redefinir-senha") && (
        <label htmlFor="reseller-password">
          {screen === "redefinir-senha" ? "Nova senha" : "Senha"}
          <input
            id="reseller-password"
            name="password"
            type="password"
            autoComplete={
              screen === "entrar" ? "current-password" : "new-password"
            }
            minLength={screen === "entrar" ? 1 : 12}
            maxLength={128}
            required
          />
          {screen !== "entrar" && (
            <span className="portal-hint">Use pelo menos 12 caracteres.</span>
          )}
        </label>
      )}
      {screen === "redefinir-senha" && (
        <label htmlFor="password-confirmation">
          Repita a nova senha
          <input
            id="password-confirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
          />
        </label>
      )}
      {screen === "cadastro" && (
        <>
          <label htmlFor="reseller-phone">
            Telefone com DDD
            <input
              id="reseller-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              minLength={10}
              maxLength={24}
              required
            />
          </label>
          <label htmlFor="reseller-unit">
            Unidade de atendimento
            <select
              id="reseller-unit"
              name="unit"
              defaultValue={locations[0]?.id ?? ""}
              required
            >
              <option value="" disabled>
                Selecione sua unidade
              </option>
              {locations.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.city} · {unit.stateCode}
                </option>
              ))}
            </select>
          </label>
          <label className="portal-checkbox">
            <input type="checkbox" name="consent" required />
            <span>
              Tenho 18 anos ou sou emancipado e autorizo o uso dos dados para
              análise do cadastro e atendimento das minhas solicitações.
            </span>
          </label>
          <p className="portal-hint">
            A aprovação é feita pela equipe Agylli. Para corrigir seus dados ou
            solicitar encerramento do cadastro, fale com sua unidade.
          </p>
        </>
      )}
    </ActionForm>
  );
}
