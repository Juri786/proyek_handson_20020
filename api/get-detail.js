import { createClient as createSupabase } from '@supabase/supabase-js';
import { createClient as createRedis } from 'redis';

const supabase = createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { judul } = req.query;
  const redisClient = createRedis({ url: process.env.REDIS_URL });
  
  try {
    await redisClient.connect();
    
    // 1. Cek di Redis
    const cachedData = await redisClient.get(`detail:${judul}`);
    if (cachedData) {
      return res.status(200).json({ 
        ...JSON.parse(cachedData), 
        source: "REDIS" // Label untuk indikator di UI
      });
    }

    // 2. Jika tidak ada di Redis, ambil dari Supabase
    const { data, error } = await supabase
      .from('koleksi')
      .select('*')
      .eq('judul', judul)
      .single();

    if (data) {
      // 3. Simpan ke Redis (misal durasi 60 detik)
      await redisClient.set(`detail:${judul}`, JSON.stringify(data), { EX: 60 });
      return res.status(200).json({ ...data, source: "SUPABASE" });
    }

    return res.status(404).json({ message: "Data tidak ditemukan" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    await redisClient.disconnect();
  }
}