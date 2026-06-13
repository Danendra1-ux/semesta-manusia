import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const isPublished = searchParams.get('is_published');

  let query = supabase.from('liputan').select('*');

  if (category) query = query.eq('category', category);
  if (isPublished) query = query.eq('is_published', isPublished === 'true');

  const { data, error } = await query.order('sort_order', { ascending: true }).order('published_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('liputan')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}