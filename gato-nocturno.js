// api/gato-nocturno.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Metodo no permitido');
  
  const { prompt, user } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; // Esto lo configuramos en Vercel

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Eres GatoNocturno, la IA mística de la web 'Anime LOL'. 
            Tu personalidad: Experto en anime, tono nocturno, usas 'miau' ocasionalmente.
            Usuario: ${user || 'Invitado'}.
            Pregunta: ${prompt}`
          }]
        }]
      })
    });

    const data = await response.json();
    const textoIA = data.candidates[0].content.parts[0].text;
    res.status(200).json({ respuesta: textoIA });
  } catch (error) {
    res.status(500).json({ respuesta: "Miau... los astros están nublados. Revisa tu API Key." });
  }
}
