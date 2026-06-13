import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      program_id, funding_type_id,
      full_name, email, whatsapp, instagram, birth_date, region, institution, reason, // Fixed Data Diri
      why_join, division_code, division_reason, program_proposal, hopes, // SJN Specific
      dynamic_answers, // Array of { field_id, value_text, value_date, value_number }
      uploaded_files // Array of { field_key, file_url, file_name, file_size, mime_type }
    } = body;

    // 1. Insert Base Registration
    const registrationCode = `REG-${program_id}-${Date.now().toString().slice(-6)}`;
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        program_id, funding_type_id, registration_code: registrationCode,
        full_name, email, whatsapp, instagram, birth_date, region, institution, reason,
        why_join, division_code, division_reason, program_proposal, hopes,
        status: 'Pending'
      })
      .select()
      .single();

    if (regError) throw regError;

    // 2. Insert Registration Files (Jika ada)
    let fileRecords = [];
    if (uploaded_files && uploaded_files.length > 0) {
      const filesToInsert = uploaded_files.map(f => ({
        registration_id: registration.id,
        ...f
      }));
      
      const { data: insertedFiles, error: fileError } = await supabase
        .from('registration_files')
        .insert(filesToInsert)
        .select();

      if (fileError) throw fileError;
      fileRecords = insertedFiles;
    }

    // 3. Insert Dynamic Form Answers
    if (dynamic_answers && dynamic_answers.length > 0) {
      const answersToInsert = dynamic_answers.map(ans => {
        // Jika jawaban berupa file, kaitkan file_id
        const relatedFile = fileRecords.find(f => f.field_key === ans.field_key);
        return {
          registration_id: registration.id,
          field_id: ans.field_id,
          value_text: ans.value_text,
          value_date: ans.value_date,
          value_number: ans.value_number,
          file_id: relatedFile ? relatedFile.id : null
        };
      });

      const { error: ansError } = await supabase
        .from('registration_answers')
        .insert(answersToInsert);

      if (ansError) throw ansError;
    }

    // 4. Update Registration Count di tabel Programs
    await supabase.rpc('increment_registration_count', { prog_id: program_id });
    // Catatan: Anda perlu membuat function RPC 'increment_registration_count' di Supabase 
    // atau gunakan metode update manual (SELECT count lalu UPDATE).

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
    .select('*, program_funding_types(label), divisions(name)');

  if (programId) query = query.eq('program_id', programId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query.order('registered_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}