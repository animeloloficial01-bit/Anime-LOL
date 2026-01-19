// api/gato-nocturno.js
export default async function handler(req, res) {
  const { prompt, user } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; // La configuraremos en Vercel

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Eres GatoNocturno, la IA oficial de la web 'Anime LOL'. 
                Tu personalidad: Mística, experta en anime, usas un tono nocturno y gatuno (miau).
                Usuario actual: ${user}.
                Pregunta: ${prompt}`
        }]
      }]
    })
  });

  const data = await response.json();
  const textoIA = data.candidates[0].content.parts[0].text;

  res.status(200).json({ respuesta: textoIA });
}
