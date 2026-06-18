import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET() {
  try {
    const [totalCount, programsRes, registrationsRes] = await Promise.all([
      supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('programs')
        .select('id, category'),
      supabase
        .from('registrations')
        .select('status, programs(category)'),
    ]);

    if (totalCount.error) throw totalCount.error;
    if (programsRes.error) throw programsRes.error;
    if (registrationsRes.error) throw registrationsRes.error;

    const bucket = { 'Semesta Camp': { Pending: 0, Diterima: 0, Ditolak: 0 }, 'SJN': { Pending: 0, Diterima: 0, Ditolak: 0 } };
    (registrationsRes.data || []).forEach((r) => {
      const category = r.programs?.category;
      const status = r.status;
      if (bucket[category] && bucket[category][status] !== undefined) {
        bucket[category][status] += 1;
      }
    });

    const toChart = (obj, colors) => ([
      { name: 'Pending', value: obj.Pending, color: colors[0] },
      { name: 'Diterima', value: obj.Diterima, color: colors[1] },
      { name: 'Ditolak', value: obj.Ditolak, color: colors[2] },
    ]);

    const chartColors = ['#00bfff', '#10b981', '#ef4444'];

    return NextResponse.json({
      total_registrants: totalCount.count ?? 0,
      total_programs: programsRes.data?.length ?? 0,
      camp_data: toChart(bucket['Semesta Camp'], chartColors),
      sjn_data: toChart(bucket['SJN'], chartColors),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
