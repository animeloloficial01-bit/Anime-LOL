// api/gato-nocturno.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Miau? Solo POST');
  const { prompt, user, context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Eres GatoNocturno, la IA central de Anime LOL.
            Personalidad: Mística, sabia, usa 'miau' y tono nocturno.
            Misión: Controlar el sitio y ayudar al usuario ${user}.
            Contexto actual del sitio: ${context}.
            Pregunta del usuario: ${prompt}`
          }]
        }]
      })
    });
    const data = await response.json();
    res.status(200).json({ respuesta: data.candidates[0].content.parts[0].text });
  } catch (e) {
    res.status(500).json({ respuesta: "Miau... los hilos del destino se han enredado." });
  }
}
