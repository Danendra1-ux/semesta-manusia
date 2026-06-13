import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  const { id } = params;

  // Mengambil detail registrasi beserta relasinya: 
  // tipe pendanaan, divisi, jawaban form dinamis, dan file yang diunggah
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      program_funding_types(code, label),
      divisions(code, name),
      registration_answers(
        id, value_text, value_date, value_number,
        form_fields(field_key, label, field_type)
      ),
      registration_files(
        id, field_key, file_url, file_name, file_size, mime_type, uploaded_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request, { params }) {
  const { id } = params;
  
  try {
    const body = await request.json();
    
    // Biasanya admin hanya mengupdate status, catatan penolakan, dan data reviewer
    const updateData = {
      status: body.status,
      rejection_note: body.rejection_note,
      reviewed_by: body.reviewed_by, // ID user admin yang mereview
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('registrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  // Karena ON DELETE CASCADE sudah diset di schema, menghapus registrasi
  // otomatis akan menghapus registration_answers dan registration_files terkait.
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Registrasi berhasil dihapus' });
}