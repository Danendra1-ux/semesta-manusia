import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request, { params }) {
  // Await params terlebih dahulu
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { data, error } = await supabase
    .from('programs')
    .select('*, program_funding_types(*)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const body = await request.json();
  
  // Tangkap field form pendaftaran
  const {
    title, event_start_date, event_end_date, location, description,
    image_url, detail_program, pekerjaan,
    custom_registration_form, // <--- TAMBAHAN BARU
    funding_deadline
  } = body;

  const { data, error } = await supabase
    .from('programs')
    .update({
      title,
      event_start_date: event_start_date || null,
      event_end_date: event_end_date || null,
      location,
      description,
      image_url,
      detail_program,
      pekerjaan,
      custom_registration_form, // <--- TAMBAHAN BARU
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update funding deadline in program_funding_types (self-funded record)
  if (funding_deadline !== undefined) {
    await supabase
      .from('program_funding_types')
      .update({ deadline: funding_deadline || null })
      .eq('program_id', id)
      .eq('code', 'self');
  }

  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const { error } = await supabase.from('programs').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Program deleted successfully' });
}