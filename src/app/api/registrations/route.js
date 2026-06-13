import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      program_id, funding_type_id,
      full_name, email, whatsapp, instagram, birth_date, region, institution, reason,
      why_join, division_code, division_reason, program_proposal, hopes,
      dynamic_answers,
      uploaded_files
    } = body;

    // =====================================================================
    // 1. CEK DUPLIKAT EMAIL ATAU WHATSAPP DI PROGRAM YANG SAMA
    // =====================================================================
    const { data: existingReg, error: checkError } = await supabase
      .from('registrations')
      .select('id')
      .eq('program_id', program_id)
      .or(`email.eq.${email},whatsapp.eq.${whatsapp}`)
      .maybeSingle();

    if (checkError) throw checkError;
    
    // Jika data ditemukan, tolak proses pendaftaran
    if (existingReg) {
      return NextResponse.json(
        { error: 'Email atau Nomor WhatsApp ini sudah terdaftar untuk program tersebut!' }, 
        { status: 400 }
      );
    }
    // =====================================================================

    // 2. Insert Base Registration
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

    // 3. Insert Registration Files (Jika ada)
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

    // 4. Insert Dynamic Form Answers
    if (dynamic_answers && dynamic_answers.length > 0) {
      const answersToInsert = dynamic_answers.map(ans => {
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

    // =====================================================================
    // 5. UPDATE REGISTRATION COUNT MANUAL (PENGGANTI RPC)
    // =====================================================================
    const { data: progData } = await supabase
      .from('programs')
      .select('registration_count')
      .eq('id', program_id)
      .single();

    if (progData) {
      await supabase
        .from('programs')
        .update({ registration_count: (progData.registration_count || 0) + 1 })
        .eq('id', program_id);
    }
    // =====================================================================

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