import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      program_id, funding_type_id,
      full_name, email, whatsapp, instagram, birth_date, region, institution, reason,
      dynamic_answers,
      uploaded_files
    } = body;

    // 0. GUARD STATUS PROGRAM / FUNDING TYPE
    // Tolak jika program non-aktif, status "Ditutup", atau
    // funding_type yang diminta Non-aktif.
    const programCheck = await supabase
      .from('programs')
      .select('id, is_active, status')
      .eq('id', program_id)
      .maybeSingle();

    if (programCheck.error) throw programCheck.error;
    if (!programCheck.data) {
      return NextResponse.json(
        { error: 'Program tidak ditemukan.' },
        { status: 404 }
      );
    }
    if (programCheck.data.is_active === false || programCheck.data.status === 'Ditutup') {
      return NextResponse.json(
        { error: 'Pendaftaran untuk program ini sudah ditutup.' },
        { status: 403 }
      );
    }
    if (funding_type_id) {
      const ftCheck = await supabase
        .from('program_funding_types')
        .select('is_active')
        .eq('id', funding_type_id)
        .maybeSingle();
      if (ftCheck.error) throw ftCheck.error;
      if (ftCheck.data && ftCheck.data.is_active === false) {
        return NextResponse.json(
          { error: 'Pendaftaran untuk tipe pendanaan ini sudah ditutup.' },
          { status: 403 }
        );
      }
    }

    // 1. CEK DUPLIKAT EMAIL ATAU WHATSAPP DI PROGRAM & TIPE PENDAFTARAN YANG SAMA
    let duplicateQuery = supabase
      .from('registrations')
      .select('id')
      .eq('program_id', program_id)
      .or(`email.eq.${email},whatsapp.eq.${whatsapp}`);

    // Sertakan funding_type_id dalam pengecekan jika tersedia,
    // agar user bisa mendaftar di tipe funding yang berbeda (Fully Funded vs Self Funded)
    // dengan email/whatsapp yang sama, khusus untuk program SJN.
    if (funding_type_id) {
      duplicateQuery = duplicateQuery.eq('funding_type_id', funding_type_id);
    } else {
      duplicateQuery = duplicateQuery.is('funding_type_id', null);
    }

    const { data: existingReg, error: checkError } = await duplicateQuery.maybeSingle();

    if (checkError) throw checkError;

    // Jika data ditemukan, tolak proses pendaftaran
    if (existingReg) {
      return NextResponse.json(
        { error: 'Email atau Nomor WhatsApp ini sudah terdaftar untuk tipe pendaftaran tersebut!' },
        { status: 400 }
      );
    }
    // 2. Insert Base Registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        program_id, funding_type_id,
        full_name, email, whatsapp, instagram, birth_date, region, institution, reason,
        status: 'Menunggu'
      })
      .select()
      .single();

    if (regError) throw regError;

    // 3. Insert Registration Files (Jika ada)
    let fileRecords = [];
    if (uploaded_files && uploaded_files.length > 0) {
      // Kita perlu mencari label asli dari field_key (ID komponen)
      const { data: programData } = await supabase
        .from('programs')
        .select('custom_registration_form, custom_registration_form_fully, custom_registration_form_self, program_funding_types(code, id)')
        .eq('id', program_id)
        .single();

      // Pilih form schema berdasarkan funding_type (SJN) atau fallback ke single
      let activeFormSchema = programData?.custom_registration_form || null;
      if (programData && funding_type_id && Array.isArray(programData.program_funding_types)) {
        const matchedFt = programData.program_funding_types.find((ft) => ft.id === funding_type_id);
        if (matchedFt) {
          if (matchedFt.code === 'fully') activeFormSchema = programData.custom_registration_form_fully || activeFormSchema;
          else if (matchedFt.code === 'self') activeFormSchema = programData.custom_registration_form_self || activeFormSchema;
        }
      }

      const filesToInsert = uploaded_files.map(f => {
        let labelText = f.field_key; // Default ke ID jika tidak ketemu
        if (activeFormSchema) {
          activeFormSchema.forEach(sec => {
            const foundField = sec.fields.find(field => field.id === f.field_key);
            if (foundField) labelText = foundField.label;
          });
        }

        return {
          registration_id: registration.id,
          ...f
        };
      });

      const { data: insertedFiles, error: fileError } = await supabase
        .from('registration_files')
        .insert(filesToInsert)
        .select();

      if (fileError) throw fileError;
      fileRecords = insertedFiles;
    }

    // 4. Insert Dynamic Form Answers
    if (dynamic_answers && dynamic_answers.length > 0) {
      const answersToInsert = dynamic_answers.map(ans => {
        return {
          registration_id: registration.id,
          field_id: ans.field_id,
          value_text: ans.value_text
        };
      });

      const { error: ansError } = await supabase
        .from('registration_answers')
        .insert(answersToInsert);

      if (ansError) throw ansError;
    }

    return NextResponse.json({ success: true, registration }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const programId = searchParams.get('program_id');
  const status = searchParams.get('status');

  let query = supabase
    .from('registrations')
    .select('*, program_funding_types(label)');

  if (programId) query = query.eq('program_id', programId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query.order('registered_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}