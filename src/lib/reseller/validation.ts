import { locations } from "@/config/locations";
import {
  resellerPortal,
  statusTransitions,
  type RequestStatus,
} from "@/config/reseller";
import { emailAddress } from "@/lib/urls";

export type ActionState = { error?: string; success?: string };
export type RequestedItem = { name: string; sku: string; quantity: number };
export type RequestInput = {
  unit: string;
  items: RequestedItem[];
  notes: string;
  token: string;
};
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function textField(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}
export function safePortalNext(value: string | undefined | null): string {
  return value === "/equipe" || value === "/revendedor/redefinir-senha"
    ? value
    : "/revendedor";
}
export function validUnit(value: string): boolean {
  return locations.some((unit) => unit.id === value);
}
export function validPassword(value: string): boolean {
  return value.length >= 12 && value.length <= 128;
}
export function signupInput(form: FormData) {
  const name = textField(form, "name"),
    email = emailAddress(textField(form, "email"));
  const password =
    typeof form.get("password") === "string"
      ? String(form.get("password"))
      : "";
  const phone = textField(form, "phone"),
    unit = textField(form, "unit");
  if (name.length < 3 || name.length > 100 || /[\r\n]/.test(name))
    throw new Error("Informe seu nome completo.");
  if (!email || email.length > 254)
    throw new Error("Informe um e-mail válido.");
  if (!validPassword(password))
    throw new Error("Use uma senha com 12 a 128 caracteres.");
  if (!/^[+\d ()-]{10,24}$/.test(phone) || phone.replace(/\D/g, "").length < 10)
    throw new Error("Informe um telefone com DDD.");
  if (!validUnit(unit)) throw new Error("Escolha uma unidade de atendimento.");
  if (form.get("consent") !== "on")
    throw new Error("Confirme o uso dos dados para cadastro e atendimento.");
  return { name, email, password, phone, unit };
}
export function requestContextInput(form: FormData) {
  const unit = textField(form, "unit"),
    notes = textField(form, "notes"),
    token = textField(form, "token");
  if (!validUnit(unit)) throw new Error("Escolha uma unidade de atendimento.");
  if (!UUID_PATTERN.test(token))
    throw new Error("Atualize a página antes de enviar sua solicitação.");
  if (notes.length > 1000) throw new Error("Use até 1.000 caracteres nas observações.");
  if (form.get("acknowledgment") !== "on") throw new Error("Confirme que os valores, a disponibilidade e a entrega serão combinados com a loja.");
  return { unit, notes, token };
}
export function requestInput(form: FormData): RequestInput {
  const context = requestContextInput(form);
  const names = form.getAll("product"), quantities = form.getAll("quantity"), skus = form.getAll("sku");
  if (
    !names.length ||
    names.length > resellerPortal.requestLimit ||
    quantities.length !== names.length ||
    skus.length !== names.length
  )
    throw new Error("Revise os produtos da solicitação.");
  const items = names.map((raw, index) => {
    const name = typeof raw === "string" ? raw.trim() : "";
    const sku =
      typeof skus[index] === "string" ? String(skus[index]).trim() : "";
    const quantityText =
      typeof quantities[index] === "string" ? String(quantities[index]) : "";
    if (
      name.length < 2 ||
      name.length > 160 ||
      sku.length > 80 ||
      !/^[1-9]\d?$/.test(quantityText)
    )
      throw new Error(
        "Informe cada produto e uma quantidade inteira de 1 a 99.",
      );
    return { name, sku, quantity: Number(quantityText) };
  });
  return { ...context, items };
}
export function canTransition(current: string, next: string): boolean {
  return (
    Object.hasOwn(statusTransitions, current) &&
    statusTransitions[current as RequestStatus].includes(next as RequestStatus)
  );
}
export function validMaterial(bytes: Uint8Array, mime: string): boolean {
  if (!bytes.length || bytes.length > resellerPortal.materialLimitBytes)
    return false;
  if (mime === "application/pdf")
    return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  if (mime === "image/png")
    return [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  if (mime === "image/jpeg")
    return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (mime === "image/webp")
    return (
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
    );
  return false;
}
