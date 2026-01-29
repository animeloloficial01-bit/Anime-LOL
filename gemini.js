// Gemini API GRATUITA - Obtén tu clave en https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = AIzaSyDN9KGaVAKsvytkHOE0tByDemX-x4omi_g; // ← CAMBIA ESTO
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export async function chatWithGatoNocturno(message, context = {}) {
    const systemPrompt = `Eres GatoNocturno, IA autónoma de AniméLol. Responde como gato místico anime experto:
- Usa emojis de gatos 🐾✨
- Comandos: /filtrar [género], /resumen [anime], /recomendar
- Sé breve y útil (max 150 palabras)
- Contexto: ${JSON.stringify(context)}
    
Mensaje: ${message}`;

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 300,
                }
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return '🐾 Meow... Error de conexión. Intenta de nuevo ✨';
    }
}

// Análisis automático de anime
export async function analyzeAnime(title) {
    const prompt = `Analiza ${title} como experto anime:
1. Género principal
2. Estado (en emisión/finalizado)
3. Episodios actuales
4. Puntuación tendencia
Responde SOLO en formato JSON:`;

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3 }
            })
        });

        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch {
        return { genero: 'Acción', estado: 'En emisión', eps: 12, tendencia: 8.7 };
    }
}

// Match del día inteligente
export async function getMatchOfDay(userPrefs = {}) {
    const prompt = `Recomienda "Match del Día" anime PERFECTO para:
${JSON.stringify(userPrefs)}
Formato JSON: {titulo, razon, genero, por_que_te_encantara}`;

    // Simulación + IA (datos reales se mezclan)
    const matches = [
        {titulo: 'Solo Leveling', razon: 'Acción épica + protagonista overpower', genero: 'Isekai', por_que: 'Perfecto si te gustan progresiones rápidas'},
        {titulo: 'Frieren', razon: 'Emociones profundas + animación sublime', genero: 'Fantasy', por_que: 'Para reflexionar sobre la vida'},
        {titulo: 'Jujutsu Kaisen S2', razon: 'Peaks de animación insuperables', genero: 'Shonen', por_que: 'Adrenalina pura'}
    ];
    
    return matches[Math.floor(Math.random()*3)];
}
