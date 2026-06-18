import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const { data, error } = await supabase
      .from('registrations')
      .select('id, program_id, full_name, status, registered_at, program_funding_types(label), programs(title, category)')
      .order('registered_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const rows = (data || []).map((r) => {
      const program = r.programs;
      const category = program?.category;
      const fundingLabel = r.program_funding_types?.label || '';
      const tipe = category === 'SJN'
        ? (/fully/i.test(fundingLabel) ? 'Fully Funded'
          : /self/i.test(fundingLabel) ? 'Self Funded'
            : '-')
        : '-';

      return {
        id: r.id,
        program_id: r.program_id,
        category,
        nama: r.full_name,
        aktivitas: program?.title || 'Program',
        tipe,
        status: r.status,
        registered_at: r.registered_at,
      };
    });

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}