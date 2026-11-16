import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PortalResource } from "./types";
import { resellerPortal } from "@/config/reseller";
import { materialPathMime } from "./material-upload";

export async function materialCovers(db: SupabaseClient, resources: PortalResource[]) {
  const coverPath = (resource: PortalResource) => resource.cover_path && materialPathMime(resource.cover_path)?.startsWith("image/") ? resource.cover_path : null;
  const videoPath = (resource: PortalResource) => resource.file_path && materialPathMime(resource.file_path)?.startsWith("video/") ? resource.file_path : null;
  const paths = [...new Set(resources.flatMap(resource => [coverPath(resource), videoPath(resource)].filter((path): path is string => !!path)))];
  if (!paths.length) return resources;
  try {
    const { data } = await db.storage.from(resellerPortal.bucket).createSignedUrls(paths, 900);
    const urls = new Map((data ?? []).map(item => [item.path, item.signedUrl]));
    return resources.map(resource => ({ ...resource, coverUrl: urls.get(coverPath(resource) ?? "") ?? null, videoUrl: urls.get(videoPath(resource) ?? "") ?? null }));
  } catch { return resources; }
}
