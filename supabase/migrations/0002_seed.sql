-- =============================================================================
-- 0002_seed.sql
-- Seed programs (16) + categories + funding types.
-- Semua UUID di-generate deterministic via gen_random_uuid() di dalam INSERT.
--
-- Cara apply: SQL Editor → paste → Run setelah 0001 selesai.
-- Idempotent: pakai ON CONFLICT (slug) DO NOTHING supaya bisa diulang aman.
-- =============================================================================

-- Seed 4 program funding types tidak dilakukan di sini — dibuat otomatis
-- saat admin POST /api/programs (lihat src/app/api/programs/route.js).
-- Untuk testing, lihat 0004_seed_for_testing.sql.

-- Seed programs dari memory: 12 programs (3 categories × 4 each)
INSERT INTO public.programs (slug, title, description, category, event_start_date, event_end_date, location, image_url, is_active, status)
VALUES
  -- Semesta Camp (4 programs)
  ('semesta-camp-1', 'Semesta Camp Batch 1', 'Program volunteering pendidikan untuk anak-anak Indonesia.', 'Semesta Camp', '2026-01-15', '2026-01-21', 'Bandung, Jawa Barat', '/images/semesta-camp-1.jpg', true, 'Dibuka'),
  ('semesta-camp-2', 'Semesta Camp Batch 2', 'Program volunteering pendidikan untuk anak-anak Indonesia.', 'Semesta Camp', '2026-03-10', '2026-03-16', 'Yogyakarta', '/images/semesta-camp-2.jpg', true, 'Dibuka'),
  ('semesta-camp-3', 'Semesta Camp Batch 3', 'Program volunteering pendidikan untuk anak-anak Indonesia.', 'Semesta Camp', '2026-06-05', '2026-06-11', 'Surabaya, Jawa Timur', '/images/semesta-camp-3.jpg', false, 'Ditutup'),
  ('semesta-camp-4', 'Semesta Camp Batch 4', 'Program volunteering pendidikan untuk anak-anak Indonesia.', 'Semesta Camp', '2026-09-01', '2026-09-07', 'Jakarta', '/images/semesta-camp-4.jpg', false, 'Ditutup'),

  -- SJN Fully Funded (4 programs)
  ('sjn-fully-1', 'SJN Fully Funded Batch 1', 'Semesta Jelajah Nusantara dengan biaya penuh dari penyelenggara.', 'SJN', '2026-02-01', '2026-02-14', 'Nusa Tenggara Timur', '/images/sjn-fully-1.jpg', true, 'Dibuka'),
  ('sjn-fully-2', 'SJN Fully Funded Batch 2', 'Semesta Jelajah Nusantara dengan biaya penuh dari penyelenggara.', 'SJN', '2026-04-15', '2026-04-28', 'Kalimantan Timur', '/images/sjn-fully-2.jpg', true, 'Dibuka'),
  ('sjn-fully-3', 'SJN Fully Funded Batch 3', 'Semesta Jelajah Nusantara dengan biaya penuh dari penyelenggara.', 'SJN', '2026-07-20', '2026-08-02', 'Sulawesi Selatan', '/images/sjn-fully-3.jpg', false, 'Ditutup'),
  ('sjn-fully-4', 'SJN Fully Funded Batch 4', 'Semesta Jelajah Nusantara dengan biaya penuh dari penyelenggara.', 'SJN', '2026-10-10', '2026-10-23', 'Papua', '/images/sjn-fully-4.jpg', false, 'Ditutup'),

  -- SJN Self Funded (4 programs)
  ('sjn-self-1', 'SJN Self Funded Batch 1', 'Semesta Jelajah Nusantara dengan biaya mandiri peserta.', 'SJN', '2026-02-01', '2026-02-14', 'Nusa Tenggara Timur', '/images/sjn-self-1.jpg', true, 'Dibuka'),
  ('sjn-self-2', 'SJN Self Funded Batch 2', 'Semesta Jelajah Nusantara dengan biaya mandiri peserta.', 'SJN', '2026-04-15', '2026-04-28', 'Kalimantan Timur', '/images/sjn-self-2.jpg', true, 'Dibuka'),
  ('sjn-self-3', 'SJN Self Funded Batch 3', 'Semesta Jelajah Nusantara dengan biaya mandiri peserta.', 'SJN', '2026-07-20', '2026-08-02', 'Sulawesi Selatan', '/images/sjn-self-3.jpg', false, 'Ditutup'),
  ('sjn-self-4', 'SJN Self Funded Batch 4', 'Semesta Jelajah Nusantara dengan biaya mandiri peserta.', 'SJN', '2026-10-10', '2026-10-23', 'Papua', '/images/sjn-self-4.jpg', false, 'Ditutup')
ON CONFLICT (slug) DO NOTHING;

-- Seed funding types untuk masing-masing SJN program (Fully + Self)
-- Deadline default = event_start_date (7 hari sebelum acara)
DO $$
DECLARE
  prog record;
BEGIN
  FOR prog IN
    SELECT id, event_start_date FROM public.programs WHERE category = 'SJN'
  LOOP
    INSERT INTO public.program_funding_types (program_id, code, label, deadline, is_default, is_active)
    VALUES
      (prog.id, 'fully', 'Fully Funded', prog.event_start_date - INTERVAL '7 days', false, true),
      (prog.id, 'self', 'Self Funded', prog.event_start_date - INTERVAL '7 days', false, true)
    ON CONFLICT (program_id, code) DO NOTHING;
  END LOOP;
END $$;

-- Seed funding type default (Self Funded) untuk Semesta Camp
DO $$
DECLARE
  prog record;
BEGIN
  FOR prog IN
    SELECT id FROM public.programs WHERE category = 'Semesta Camp'
  LOOP
    INSERT INTO public.program_funding_types (program_id, code, label, deadline, is_default, is_active)
    VALUES (prog.id, 'self', 'Self Funded', NULL, true, true)
    ON CONFLICT (program_id, code) DO NOTHING;
  END LOOP;
END $$;
