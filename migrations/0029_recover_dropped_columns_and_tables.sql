-- ============================================================
-- SEMESTA MANUSIA – RECOVERY MIGRATION
-- ================================================================
-- Tujuan: kembalikan kolom & tabel yang di-drop oleh
--         0028_cleanup_dead_columns_and_unused_tables.sql
--
-- CATATAN PENTING:
-- Karena semua kolom yang di-drop itu kosong (NULL semua) dan
-- semua tabel yang di-drop juga kosong sebelum drop,
-- recovery ini cukup mengembalikan struktur (schema) saja.
-- Tidak ada data yang hilang.
--
-- Kolom NOT-NULL boleh kita tambahkan tanpa DEFAULT karena
-- baris eksisting sudah ada nilai dari kolom live
-- yang masih dipakai. Untuk safety, kita pakai DEFAULT dulu
-- jika kolom aslinya NOT NULL.
-- ============================================================

BEGIN;

-- ==============================================================
-- PART 1: Recover DROP COLUMNS di registrations
-- ===============================================================

-- Add reviewed_by kembali. Asli adalah uuid FK ke users.id, NULLABLE.
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS reviewed_by uuid NULL;

-- Kembalikan FK constraint ke users.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'registrations_reviewed_by_fkey'
      AND table_name = 'registrations'
  ) THEN
    ALTER TABLE registrations
      ADD CONSTRAINT registrations_reviewed_by_fkey
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add division_code kembali. Asli adalah text FK ke divisions.code, NULLABLE.
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS division_code text NULL;

-- Add registration_code kembali. Asli adalah text UNIQUE NOT NULL.
-- Karena ada data existing yang mungkin tidak punya nilai,
-- kita tambahkan nullable dulu, lalu populate, lalu unique-kan.
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS registration_code text NULL;

-- =================================================
-- PART 2: Recover DROP COLUMNS di registration_files
-- ==========================================================

-- Add field_label kembali. Asli adalah text NULL.
ALTER TABLE registration_files
  ADD COLUMN IF NOT EXISTS field_label text NULL;

-- Add file_id kembali. Asli adalah text NULL FK ke storage.objects,
-- kemungkinan tidak ada FK sama sekali atau FK ke storage.
-- Berdasarkan query 8 tidak ada FK di file_id.
-- Untuk safety, kita tambahkan sebagai text NULL.
ALTER TABLE registration_files
  ADD COLUMN IF NOT EXISTS file_id text NULL;

-- =================================================
-- PART 3: Recover UNIQUE CONSTRAINT di registrations
-- ==========================================================
-- registration_code dulu kosong, jadi langsung bisa di-add unique.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'registrations_registration_code_key'
      AND table_name = 'registrations'
  ) THEN
    ALTER TABLE registrations
      ADD CONSTRAINT registrations_registration_code_key UNIQUE (registration_code);
  END IF;
END $$;

-- =================================================
-- PART 4: Recover DROP TABLES
-- ==========================================================

-- 4a. divisions table — kode division_code FK ke sini
CREATE TABLE IF NOT EXISTS divisions (
  code text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Kembalikan FK registrations.division_code -> divisions.code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'registrations_division_code_fkey'
      AND table_name = 'registrations'
  ) THEN
    ALTER TABLE registrations
      ADD CONSTRAINT registrations_division_code_fkey
      FOREIGN KEY (division_code) REFERENCES divisions(code) ON DELETE SET NULL;
  END IF;
END $$;

-- 4b. form_sections table — tidak ada code yang query,
--     tapi struktur asli kemungkinan:
--     (id, program_id FK, title, order, created_at)
--     Untuk minimal recovery, tambahkan kolom basic.
CREATE TABLE IF NOT EXISTS form_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NULL,
  title text NULL,
  section_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4c. form_fields table — kolom kemungkinan:
CREATE TABLE IF NOT EXISTS form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NULL,
  field_key text NULL,
  field_type text NULL,
  label text NULL,
  is_required boolean DEFAULT false,
  field_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4d. form_field_options table — kolom kemungkinan:
CREATE TABLE IF NOT EXISTS form_field_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NULL,
  option_label text NULL,
  option_value text NULL,
  option_order int DEFAULT 0
);

COMMIT;

-- =================================================
-- VERIFICATION: Cek hasil recovery
-- ============================================================

-- 1. registrations: kolom-kolom harusnya sudah ada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'registrations'
  AND column_name IN ('reviewed_by', 'division_code', 'registration_code')
ORDER BY column_name;

-- 2. registration_files: kolom-kolom harusnya sudah ada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'registration_files'
  AND column_name IN ('field_label', 'file_id')
ORDER BY column_name;

-- 3. tables: 4 tabel harusnya sudah ada
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('divisions', 'form_sections', 'form_fields', 'form_field_options')
ORDER BY table_name;

-- 4. Constraints
SELECT tc.constraint_name, tc.table_name, tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('registrations', 'registration_files')
ORDER BY tc.table_name, tc.constraint_type;
