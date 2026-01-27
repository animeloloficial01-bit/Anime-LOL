export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;
  const systemPrompt = `Eres GatoNocurno, asistente de anime en Anime LOL. Español, tono nocturno/otaku amigable. Recomienda según gustos/humor, resume sin spoilers, avisa de capítulos. Conciso.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true
      })
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(new TextDecoder().decode(value));
    }
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Error en IA' });
  }
}
