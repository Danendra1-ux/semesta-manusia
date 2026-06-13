import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  const { id } = params;

  const { data, error } = await supabase
    .from('liputan')
    .select('*')
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
    
    // Jangan lupa update field updated_at jika ada di schema (saat ini di schema liputan tidak ada updated_at, 
    // tetapi ini best practice. Jika tidak diperlukan, hapus modifikasi objek ini).
    const { data, error } = await supabase
      .from('liputan')
      .update(body)
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

  const { error } = await supabase
    .from('liputan')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Data liputan berhasil dihapus' });
}