import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  // 1. WAJIB AWAIT PARAMS DI SINI
  const { id } = await params;

  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      program_funding_types(code, label),
      divisions(code, name),
      registration_answers(
        id, field_id, field_label, value_text, value_date, value_number
      ),
      registration_files(
        id, field_key, file_url, file_name, file_size, mime_type, uploaded_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116' || error.message?.includes('single')) {
      return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request, { params }) {
  // 2. WAJIB AWAIT PARAMS DI SINI
  const { id } = await params;
  
  try {
    const body = await request.json();
    
    const updateData = {
      status: body.status,
      rejection_note: body.rejection_note,
      reviewed_by: body.reviewed_by, 
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
  // 3. WAJIB AWAIT PARAMS DI SINI
  const { id } = await params;

  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Registrasi berhasil dihapus' });
}