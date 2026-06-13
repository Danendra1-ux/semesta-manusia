import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request, { params }) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('programs')
    .select('*, program_funding_types(*)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    
    // Pisahkan funding_deadline dari data utama program
    const { funding_deadline, ...programData } = body;

    // 1. Update tabel utama 'programs'
    const { data, error } = await supabase
      .from('programs')
      .update({ ...programData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // 2. Simpan Batas Registrasi (Cek apakah sudah ada)
    if (funding_deadline !== undefined) {
      const { data: existingFunding } = await supabase
        .from('program_funding_types')
        .select('id')
        .eq('program_id', id);

      if (existingFunding && existingFunding.length > 0) {
        // Jika data pendanaan sudah ada, lakukan UPDATE
        await supabase
          .from('program_funding_types')
          .update({ deadline: funding_deadline ? funding_deadline : null })
          .eq('program_id', id);
      } else {
        // Jika belum ada (karena program baru dibuat), lakukan INSERT
        await supabase
          .from('program_funding_types')
          .insert({
            program_id: id,
            code: 'self', // Default untuk Semesta Camp
            label: 'Self Funded',
            deadline: funding_deadline ? funding_deadline : null,
            is_default: true
          });
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const { error } = await supabase.from('programs').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Program deleted successfully' });
}