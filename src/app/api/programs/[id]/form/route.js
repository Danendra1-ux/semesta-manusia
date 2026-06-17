import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { data: program, error } = await supabase
    .from('programs')
    .select('custom_registration_form, custom_registration_form_fully, custom_registration_form_self')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json({
    custom_registration_form: program?.custom_registration_form || [],
    custom_registration_form_fully: program?.custom_registration_form_fully || [],
    custom_registration_form_self: program?.custom_registration_form_self || [],
  });
}