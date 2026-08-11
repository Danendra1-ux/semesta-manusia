import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await sb.from('programs').select('id, title, image_url').limit(20);
if (error) console.error(error);
else console.log(JSON.stringify(data, null, 2));
