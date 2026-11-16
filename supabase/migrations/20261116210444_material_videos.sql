begin;
-- Add supported video types while preserving existing types, privacy and size limits.
update storage.buckets
set allowed_mime_types = array(
  select distinct mime from unnest(allowed_mime_types || array['video/mp4','video/webm']) as mime order by mime
)
where id = 'reseller-materials' and allowed_mime_types is not null;
commit;
