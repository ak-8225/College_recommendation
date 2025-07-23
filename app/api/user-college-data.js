import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone');
  if (!phone) {
    return new Response(JSON.stringify({ error: 'Missing phone parameter' }), { status: 400 });
  }
  const { data, error } = await supabase
    .from('user_college_data')
    .select('*')
    .eq('phone', phone)
    .single();
  if (error && error.code !== 'PGRST116') { // Not found is not an error
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  // Map 'college_order' to 'collegeOrder' for frontend compatibility
  const response = data ? { ...data, collegeOrder: data.college_order, college_order: undefined } : { collegeOrder: [], notes: {} };
  return new Response(JSON.stringify(response), { status: 200 });
}

export async function POST(req) {
  const body = await req.json();
  const { phone, college_order, notes } = body;
  if (!phone) {
    return new Response(JSON.stringify({ error: 'Missing phone in body' }), { status: 400 });
  }
  const { error } = await supabase
    .from('user_college_data')
    .upsert({ phone, college_order, notes });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 