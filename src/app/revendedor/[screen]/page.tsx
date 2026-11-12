import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { AuthForm, type AuthScreen } from "@/components/reseller/auth-form";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { safePortalNext } from "@/lib/reseller/validation";
const screens = {
  entrar: {
    title: "Que bom ter você aqui.",
    description: "Entre para acompanhar sua parceria com a Agylli.",
  },
  cadastro: {
    title: "Vamos crescer juntos?",
    description:
      "Crie seu acesso. A equipe da sua unidade analisará seu cadastro.",
  },
  "recuperar-senha": {
    title: "Vamos recuperar seu acesso.",
    description: "Informe o e-mail usado no cadastro.",
  },
  "redefinir-senha": {
    title: "Um novo acesso para você.",
    description: "Escolha uma nova senha para sua conta.",
  },
  "reenviar-confirmacao": {
    title: "Vamos confirmar seu acesso.",
    description: "Solicite um novo e-mail de confirmação sem repetir seu cadastro.",
  },
};
export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ screen: string }>;
  searchParams: Promise<{ next?: string; notice?: string }>;
}) {
  const { screen } = await params;
  if (!Object.hasOwn(screens, screen)) notFound();
  const content = screens[screen as AuthScreen],
    query = await searchParams,
    enabled = !!supabaseSettings();
  return (
    <section className="container portal-auth">
      <div className="portal-auth-story">
        <Link href="/atacado" className="inline-link">
          Voltar para revenda
        </Link>
        <p className="eyebrow">SUA PRÓXIMA CONEXÃO AGYLLI</p>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <ul>
          {[
            "Seus pedidos e o andamento do atendimento",
            "Catálogos e materiais para a sua revenda",
            "Uma equipe perto de cada próximo passo",
          ].map((text) => (
            <li key={text}>
              <Check size={19} aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
        <span className="portal-auth-wordmark">Cuidado que conecta.</span>
      </div>
      <div className="portal-auth-card">
        <p className="eyebrow">ÁREA DO REVENDEDOR</p>
        <h2>
          {screen === "entrar"
            ? "Acesse sua conta"
            : screen === "cadastro"
              ? "Seu cadastro começa aqui"
              : screen === "reenviar-confirmacao"
                ? "Reenviar confirmação"
                : "Recuperação de acesso"}
        </h2>
        {!enabled && (
          <p className="portal-message" role="status">
            O acesso online está em preparação. Fale com sua unidade para
            continuar o atendimento.
          </p>
        )}
        {(query.notice === "confirmation-error" || query.notice === "confirmation-session-error") && (
          <p className="portal-message error" role="alert">
            {query.notice === "confirmation-session-error"
              ? "Não foi possível iniciar a sessão neste navegador. Se já confirmou seu e-mail, entre com sua senha. Para confirmar novamente, solicite outro e-mail e abra o novo link no mesmo navegador."
              : "Não foi possível usar este link. Ele pode ter expirado ou já ter sido utilizado. Se já confirmou seu e-mail, entre com sua senha. Caso contrário, reenvie a confirmação."}
          </p>
        )}
        <AuthForm
          screen={screen as AuthScreen}
          enabled={enabled}
          next={safePortalNext(query.next)}
        />
        <div className="portal-auth-links">
          {screen !== "entrar" && (
            <Link href="/revendedor/entrar">
              Já tenho cadastro. Entrar{" "}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
          {screen === "entrar" && (
            <>
              <Link href="/revendedor/recuperar-senha">
                Esqueci minha senha
              </Link>
              <Link href="/revendedor/reenviar-confirmacao">
                Reenviar e-mail de confirmação
              </Link>
              <Link href="/revendedor/cadastro">
                Ainda não tenho cadastro{" "}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </>
          )}
          <Link href="/contato?assunto=revenda">
            Preciso de ajuda com meu acesso
          </Link>
        </div>
      </div>
    </section>
  );
}
