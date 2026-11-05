import { PageIntro } from "@/components/marketing/page-intro";
import { ActionLink } from "@/components/ui/action-link";
export default function NotFound() {
  return <PageIntro eyebrow="PÁGINA NÃO ENCONTRADA" title="Vamos encontrar um novo caminho?"><p>Esse endereço não está disponível. Nosso universo de beleza continua na página inicial.</p><ActionLink href="/">Voltar ao início</ActionLink></PageIntro>;
}
