import { createClient } from '@supabase/supabase-client';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  try {
    // Traemos las últimas noticias/tendencias de las últimas 24 horas
    const { data, error } = await supabase
      .from('noticias_tendencias')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.status(200).json({ 
      exito: true, 
      datos: data,
      mensajeIA: "Miau... los astros se han alineado. Aquí tienes lo más nuevo."
    });
  } catch (e) {
    res.status(500).json({ exito: false, mensajeIA: "Miau... la conexión con el más allá falló." });
  }
}
