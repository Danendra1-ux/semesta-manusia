-- ========================================
-- SEMESTA MANUSIA – CLEANUP MIGRATION
-- ==========================================
-- Tujuan: hapus dead columns dan unused tables
-- Status: AUDIT COMPLETE — siap drop
-- ========================================

BEGIN;

-- ======================================
-- PART 1: Drop DEAD COLUMNS
-- ========================================

-- ---------- registrations ----------

-- FK ke users.id, tapi tidak pernah di-set atau di-query
ALTER TABLE registrations DROP COLUMN IF EXISTS reviewed_by;

-- FK ke divisions.code, tidak pernah di-set, FK join tidak pernah dibaca
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_division_code_fkey;
ALTER TABLE registrations DROP COLUMN IF EXISTS division_code;

-- Unique constraint ada, tapi tidak ada code yang generate atau query nilai ini
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_registration_code_key;
ALTER TABLE registrations DROP COLUMN IF EXISTS registration_code;

-- ---------- registration_files ----------

-- Column kosong (selalu NULL), tidak pernah di-insert atau di-query
-- (yang aktif dipakai: field_key)
ALTER TABLE registration_files DROP COLUMN IF EXISTS field_label;
ALTER TABLE registration_files DROP COLUMN IF EXISTS file_id;

-- ========== PART 2: Drop UNUSED TABLES ==========

-- Urutan CASCADE penting: form_field_options → form_fields → form_sections
DROP TABLE IF EXISTS form_field_options CASCADE;
DROP TABLE IF EXISTS form_fields CASCADE;
DROP TABLE IF EXISTS form_sections CASCADE;
DROP TABLE IF EXISTS divisions CASCADE;

COMMIT;
