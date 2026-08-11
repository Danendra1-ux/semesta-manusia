import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const STATUSES = ['Menunggu', 'Diterima', 'Ditolak'];

export async function GET() {
  try {
    const [totalCount, programsRes] = await Promise.all([
      supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('programs')
        .select('id, category'),
    ]);

    if (totalCount.error) throw totalCount.error;
    if (programsRes.error) throw programsRes.error;

    const campIds = (programsRes.data || [])
      .filter((p) => p.category === 'Semesta Camp')
      .map((p) => p.id);
    const sjnIds = (programsRes.data || [])
      .filter((p) => p.category === 'SJN')
      .map((p) => p.id);

    const countQueries = [];
    for (const status of STATUSES) {
      for (const [category, ids] of [['Semesta Camp', campIds], ['SJN', sjnIds]]) {
        if (ids.length === 0) {
          countQueries.push(Promise.resolve({ count: 0 }));
        } else {
          countQueries.push(
            supabase
              .from('registrations')
              .select('id', { count: 'exact', head: true })
              .eq('status', status)
              .in('program_id', ids),
          );
        }
      }
    }

    const results = await Promise.all(countQueries);
    results.forEach((q) => { if (q.error) throw q.error; });

    const get = (category, status) => {
      const catIdx = category === 'Semesta Camp' ? 0 : 1;
      const statIdx = STATUSES.indexOf(status);
      return results[statIdx * 2 + catIdx].count ?? 0;
    };

    const chartColors = ['#00bfff', '#10b981', '#ef4444'];

    const toChart = (category) => STATUSES.map((status, i) => ({
      name: status,
      value: get(category, status),
      color: chartColors[i],
    }));

    return NextResponse.json({
      total_registrants: totalCount.count ?? 0,
      total_programs: programsRes.data?.length ?? 0,
      camp_data: toChart('Semesta Camp'),
      sjn_data: toChart('SJN'),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}