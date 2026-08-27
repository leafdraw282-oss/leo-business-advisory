-- ============================================================================
-- Storage bucket for site images.
--
-- Run this AFTER 0002_rls_policies.sql (it depends on admin_users/is_admin()).
--
-- Bucket "site-images" is public-read (this is a public marketing site —
-- there's no reason to gate image loads behind signed URLs) and
-- admin-write only. Suggested folder layout inside the bucket, purely for
-- your own organization (Storage doesn't enforce folder structure) —
-- mirrors profile.js's existing image slots:
--   site-images/hero/
--   site-images/about/
--   site-images/case-studies/
--   site-images/gallery/
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "site_images_public_read"
  on storage.objects for select
  using (bucket_id = 'site-images');

create policy "site_images_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'site-images' and is_admin());

create policy "site_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'site-images' and is_admin());

create policy "site_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'site-images' and is_admin());
