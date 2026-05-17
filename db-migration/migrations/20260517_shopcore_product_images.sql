begin;

-- ========== Product Image Columns ==========

alter table public.products
  add column if not exists image_url varchar(500),
  add column if not exists image_public_id varchar(255);

commit;
