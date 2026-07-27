import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request, { params }) {
  // Await params terlebih dahulu
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { data, error } = await supabase
    .from('programs')
    .select('*, program_funding_types(*), registrations(count)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  data.registration_count = Array.isArray(data.registrations) && data.registrations[0]
    ? data.registrations[0].count
    : 0;
  delete data.registrations;

  return NextResponse.json(data);
}

export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const body = await request.json();

  const {
    title, event_start_date, event_end_date, location, description,
    image_url, detail_program, pekerjaan, status, is_active,
    custom_registration_form,
    custom_registration_form_fully,
    custom_registration_form_self,
    funding_deadline,
    program_funding_types
  } = body;

  const updatePayload = {
    updated_at: new Date().toISOString()
  };

  if (title !== undefined) updatePayload['title'] = title;
  if (event_start_date !== undefined) updatePayload['event_start_date'] = event_start_date || null;
  if (event_end_date !== undefined) updatePayload['event_end_date'] = event_end_date || null;
  if (location !== undefined) updatePayload['location'] = location;
  if (description !== undefined) updatePayload['description'] = description;
  if (image_url !== undefined) updatePayload['image_url'] = image_url;
  if (detail_program !== undefined) updatePayload['detail_program'] = detail_program;
  if (pekerjaan !== undefined) updatePayload['pekerjaan'] = pekerjaan;
  if (custom_registration_form !== undefined) updatePayload['custom_registration_form'] = custom_registration_form;

  if (custom_registration_form_fully !== undefined) {
    updatePayload['custom_registration_form_fully'] = custom_registration_form_fully;
  }
  if (custom_registration_form_self !== undefined) {
    updatePayload['custom_registration_form_self'] = custom_registration_form_self;
  }
  if (status !== undefined) {
    updatePayload['status'] = status;
  }
  if (is_active !== undefined) {
    updatePayload['is_active'] = is_active;
  }

  const { data, error } = await supabase
    .from('programs')
    .update(updatePayload)
    .eq('id', id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync program_funding_types: update existing codes, insert new ones.
  // We do NOT delete rows because `registrations.funding_type_id` has a FK
  // pointing to this table.  Legacy/stale rows are soft-disabled (see below).
  if (Array.isArray(program_funding_types) && program_funding_types.length > 0) {
    for (const ft of program_funding_types) {
      const { data: existing } = await supabase
        .from('program_funding_types')
        .select('id')
        .eq('program_id', Number(id))
        .eq('code', ft.code)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('program_funding_types')
          .update({
            label: ft.label,
            deadline: ft.deadline || null,
            is_active: ft.is_active !== false,
          })
          .eq('id', existing.id);
      } else {
        // Only insert if there is no OTHER active row with the same code
        // for this program (race-condition guard when there's no DB unique constraint).
        const { data: other } = await supabase
          .from('program_funding_types')
          .select('id')
          .eq('program_id', Number(id))
          .eq('code', ft.code)
          .eq('is_active', true)
          .maybeSingle();

        if (other) {
          // Another race won — update that row instead of inserting.
          await supabase
            .from('program_funding_types')
            .update({
              label: ft.label,
              deadline: ft.deadline || null,
              is_active: true,
            })
            .eq('id', other.id);
        } else {
          await supabase
            .from('program_funding_types')
            .insert({
              program_id: Number(id),
              code: ft.code,
              label: ft.label,
              deadline: ft.deadline || null,
              is_active: ft.is_active !== false,
            });
        }
      }
    }
  }

  // 2) Soft-disable stale active rows that are no longer in the payload.
  const codes = Array.isArray(program_funding_types)
    ? new Set(program_funding_types.map((ft) => ft.code))
    : new Set();

  if (codes.size > 0) {
    const { data: allActive } = await supabase
      .from('program_funding_types')
      .select('id, code')
      .eq('program_id', Number(id))
      .eq('is_active', true);

    const staleIds = (allActive || [])
      .filter((r) => !codes.has(r.code))
      .map((r) => r.id);

    if (staleIds.length > 0) {
      await supabase
        .from('program_funding_types')
        .update({ is_active: false })
        .in('id', staleIds);
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // 1. Hapus registrations (yang punya FK ke funding_type_id & program_id)
  await supabase
    .from('registrations')
    .delete()
    .eq('program_id', id);

  // 2. Hapus funding types (setelah registrations aman)
  await supabase
    .from('program_funding_types')
    .delete()
    .eq('program_id', Number(id));

  // 3. Hapus program itu sendiri
  const { error } = await supabase.from('programs').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Program deleted successfully' });
}