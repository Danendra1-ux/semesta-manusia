-- =============================================================================
-- 0001_uuid_pk.sql
-- Drop & recreate 5 core tables with UUID primary keys.
--
-- Cara apply: buka Supabase Dashboard → SQL Editor → paste seluruh isi file ini
-- → Run. Urutan eksekusi dijamin aman (semua tabel di-drop dulu).
--
-- PERHATIAN: query ini MENGHAPUS SEMUA DATA di tabel-tabel berikut:
--   programs, program_funding_types, registrations,
--   registration_files, registration_answers.
-- Tabel lain (public.users, public.reviews, dll) TIDAK tersentuh.
-- =============================================================================

-- 1) Drop urutan anak → induk
DROP TABLE IF EXISTS public.registration_answers CASCADE;
DROP TABLE IF EXISTS public.registration_files CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.program_funding_types CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;

-- 2) Helper: gen_random_uuid() sudah built-in di Postgres 13+ (Supabase default)

-- 3) Re-create schema dengan UUID PK
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar NOT NULL UNIQUE,
  title varchar NOT NULL,
  description text,
  category varchar NOT NULL,
  event_start_date date,
  event_end_date date,
  location varchar,
  image_url varchar,
  is_active boolean DEFAULT true,
  status varchar DEFAULT 'Dibuka',
  registration_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  detail_program jsonb DEFAULT '[]'::jsonb,
  pekerjaan jsonb DEFAULT '[]'::jsonb,
  custom_registration_form jsonb DEFAULT '[]'::jsonb,
  custom_registration_form_fully jsonb,
  custom_registration_form_self jsonb
);

CREATE TABLE public.program_funding_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  code varchar NOT NULL,
  label varchar NOT NULL,
  deadline date,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  UNIQUE (program_id, code)
);

CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  funding_type_id uuid REFERENCES public.program_funding_types(id) ON DELETE SET NULL,
  full_name varchar NOT NULL,
  email varchar NOT NULL,
  whatsapp varchar NOT NULL,
  instagram varchar,
  birth_date date NOT NULL,
  region varchar NOT NULL,
  institution varchar NOT NULL,
  reason text,
  status varchar DEFAULT 'Pending',
  reviewed_at timestamptz,
  registered_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.registration_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  field_key varchar NOT NULL,
  file_url varchar NOT NULL,
  file_name varchar NOT NULL,
  file_size integer,
  mime_type varchar,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE public.registration_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  field_id varchar NOT NULL,
  value_text text
);

-- 4) Indexes untuk query yang sering dipakai
CREATE INDEX idx_programs_category ON public.programs(category);
CREATE INDEX idx_programs_is_active ON public.programs(is_active);
CREATE INDEX idx_program_funding_types_program_id ON public.program_funding_types(program_id);
CREATE INDEX idx_registrations_program_id ON public.registrations(program_id);
CREATE INDEX idx_registrations_email ON public.registrations(email);
CREATE INDEX idx_registrations_status ON public.registrations(status);
CREATE INDEX idx_registration_files_registration_id ON public.registration_files(registration_id);
CREATE INDEX idx_registration_answers_registration_id ON public.registration_answers(registration_id);
