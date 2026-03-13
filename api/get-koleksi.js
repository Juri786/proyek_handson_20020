import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from('koleksi').select('*');
    
    if (error) {
      console.error("Supabase Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json(data);
  } catch (err) {
    console.error("Server Error:", err.message);
    return res.status(500).json({ error: "Gagal terhubung ke database" });
  }
}