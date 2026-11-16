begin;

alter table public.reseller_resources
  add column cover_path text
  constraint reseller_resources_cover_path_check
  check (cover_path is null or cover_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$');

-- Preserve staff access and approved-only reads of active material attachments/covers.
alter policy portal_material_read on storage.objects
using (
  bucket_id = 'reseller-materials'
  and (
    public.portal_is_staff()
    or (
      public.portal_is_approved()
      and exists (
        select 1 from public.reseller_resources r
        where r.active and (r.file_path = objects.name or r.cover_path = objects.name)
      )
    )
  )
);

commit;
