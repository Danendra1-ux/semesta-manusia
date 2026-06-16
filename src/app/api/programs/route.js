import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const isActive = searchParams.get('is_active');

  let query = supabase
    .from('programs')
    .select('*, program_funding_types(*), registrations(count)');

  if (category) query = query.eq('category', category);
  if (isActive) query = query.eq('is_active', isActive === 'true');

  const { data, error } = await query.order('created_at', { ascending: false });

  if (!error && Array.isArray(data)) {
    data.forEach((p) => {
      p.registration_count = Array.isArray(p.registrations) && p.registrations[0]
        ? p.registrations[0].count
        : 0;
      delete p.registrations;
    });
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Ekstrak semua field — termasuk JSON columns
    const {
      funding_types,
      funding_deadline,
      detail_program,
      pekerjaan,
      custom_registration_form,
      ...programData
    } = body;

    // 2. Generate slug otomatis (Jika title ada)
    if (programData.title && !programData.slug) {
      programData.slug = programData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    }

    // 3. Insert Program
    const { data: program, error: progError } = await supabase
      .from('programs')
      .insert({
        ...programData,
        detail_program: detail_program || null,
        pekerjaan: pekerjaan || null,
        custom_registration_form: custom_registration_form || null,
      })
      .select()
      .single();

    if (progError) throw progError;

    // 4. Insert Funding Types (atau insert deadline saja jika tidak ada array funding_types)
    if (funding_types && funding_types.length > 0) {
      const fundingData = funding_types.map(ft => ({
        ...ft,
        program_id: program.id
      }));
      await supabase.from('program_funding_types').insert(fundingData);
    } else {
      // Jika tidak ada array khusus, buatkan default record untuk batas registrasi (deadline)
      await supabase.from('program_funding_types').insert({
        program_id: program.id,
        code: 'self',
        label: 'Self Funded',
        deadline: funding_deadline || null,
        is_default: true
      });
    }

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}