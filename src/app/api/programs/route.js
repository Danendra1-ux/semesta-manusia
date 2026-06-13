import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const isActive = searchParams.get('is_active');

  let query = supabase.from('programs').select('*, program_funding_types(*)');

  if (category) query = query.eq('category', category);
  if (isActive) query = query.eq('is_active', isActive === 'true');

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { funding_types, ...programData } = body;

    // --- TAMBAHAN LOGIC GENERATE SLUG ---
    if (programData.title) {
      // Ubah title jadi huruf kecil, ganti spasi/karakter aneh jadi strip (-)
      const baseSlug = programData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      
      // Tambahin timestamp pendek di belakangnya biar pasti UNIQUE dan nggak bentrok di DB
      programData.slug = `${baseSlug}-${Math.floor(Date.now() / 1000)}`;
    }
    // ------------------------------------

    // 1. Insert Program
    const { data: program, error: progError } = await supabase
      .from('programs')
      .insert(programData)
      .select()
      .single();

    if (progError) throw progError;

    // 2. Insert Funding Types jika ada (Fully/Self Funded)
    if (funding_types && funding_types.length > 0) {
      const fundingData = funding_types.map(ft => ({
        ...ft,
        program_id: program.id
      }));
      const { error: fundError } = await supabase
        .from('program_funding_types')
        .insert(fundingData);
        
      if (fundError) throw fundError;
    }

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}