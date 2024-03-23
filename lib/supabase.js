import { createClient } from "@supabase/supabase-js";

// GET SUPABASE KEY FROM .ENV.LOCAL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
