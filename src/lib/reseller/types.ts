import type { RequestStatus } from "@/config/reseller";
export type RequestItem = {
  id?: string;
  name: string;
  sku: string | null;
  quantity: number;
};
export type PortalRequest = {
  id: string;
  user_id: string;
  unit_id: string;
  status: RequestStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  reseller_request_items: RequestItem[];
};
export type PortalProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit_id: string;
  status: "pending" | "approved" | "suspended";
};
export type PortalResource = {
  id: string;
  title: string;
  description: string;
  category: "catalogo" | "divulgacao" | "beneficio";
  file_path: string | null;
  active: boolean;
  created_at: string;
};
export type PurchaseRecord = {
  id: string;
  purchased_at: string;
  source_reference: string;
  unit_id: string;
  total_brl: number | null;
  summary: string;
};
export function requestReference(id: string) {
  return `AG-${id.slice(0, 8).toUpperCase()}`;
}
export function portalDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bahia",
  }).format(new Date(date));
}
