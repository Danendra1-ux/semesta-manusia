import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request, { params }) {
  const { id } = params;

  // Mengambil relasi bertingkat: sections -> fields -> options
  const { data, error } = await supabase
    .from('form_sections')
    .select(`
      id, section_key, title, description, is_fixed, sort_order,
      form_fields (
        id, field_key, label, field_type, placeholder, is_required, is_fixed, sort_order,
        form_field_options (id, value, label, sort_order)
      )
    `)
    .eq('program_id', id)
    .order('sort_order', { ascending: true })
    .order('sort_order', { referencedTable: 'form_fields', ascending: true })
    .order('sort_order', { referencedTable: 'form_fields.form_field_options', ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}