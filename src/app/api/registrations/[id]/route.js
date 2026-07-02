import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendRegistrationNotification } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  // 1. WAJIB AWAIT PARAMS DI SINI
  const { id } = await params;

  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      program_funding_types(code, label),
      registration_answers(
        id, field_id, value_text
      ),
      registration_files(
        id, field_key, file_url, file_name, file_size, mime_type, uploaded_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116' || error.message?.includes('single')) {
      return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request, { params }) {
  // 2. WAJIB AWAIT PARAMS DI SINI
  const { id } = await params;

  try {
    const body = await request.json();

    const updateData = {
      status: body.status,
      reviewed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('registrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Kirim notifikasi email setelah status berubah ke Diterima/Ditolak.
    // Tidak kirim saat Pending atau update non-status lainnya.
    if (data && (data.status === 'Diterima' || data.status === 'Ditolak')) {
      const programTitle = await fetchProgramTitle(data.program_id);

      console.log(`[registrations] Mengirim email ${data.status} ke ${data.email} untuk program "${programTitle}"`);

      let emailResult;
      if (data.status === 'Diterima') {
        emailResult = await sendRegistrationNotification({
          to: data.email,
          name: data.full_name,
          subject: `Selamat! Pendaftaran "${programTitle}" Anda Diterima`,
          bodyHtml: `
            <p>Kami dengan senang hati menginformasikan bahwa pendaftaran Anda untuk program <strong>${programTitle}</strong> telah <strong style="color:#16a34a;">DITERIMA</strong>.</p>
            <p>Silakan menunggu informasi selanjutnya dari tim kami terkait jadwal, teknis pelaksanaan, dan hal-hal lain yang perlu Anda persiapkan.</p>
            <p>Terima kasih telah mendaftar. Semoga perjalanan ini membawa manfaat bagi kita semua.</p>
          `,
        });
      } else {
        emailResult = await sendRegistrationNotification({
          to: data.email,
          name: data.full_name,
          subject: `Pendaftaran "${programTitle}" Belum Dapat Diterima`,
          bodyHtml: `
            <p>Terima kasih atas minat Anda untuk mendaftar di program <strong>${programTitle}</strong>.</p>
            <p>Setelah melakukan peninjauan, dengan berat hati kami sampaikan bahwa pendaftaran Anda <strong style="color:#dc2626;">belum dapat diterima</strong> pada periode ini.</p>
            <p>Jangan berkecil hati — kami berharap dapat berjumpa dengan Anda di kesempatan berikutnya.</p>
          `,
        });
      }

      console.log('[registrations] Email result:', JSON.stringify(emailResult));

      return NextResponse.json({ ...data, emailSent: emailResult.success });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function fetchProgramTitle(programId) {
  if (!programId) return 'Program';
  const { data } = await supabase
    .from('programs')
    .select('title')
    .eq('id', programId)
    .single();
  return data?.title || 'Program';
}

export async function DELETE(request, { params }) {
  // 3. WAJIB AWAIT PARAMS DI SINI
  const { id } = await params;

  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Registrasi berhasil dihapus' });
}