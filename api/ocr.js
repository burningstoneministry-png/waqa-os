// api/ocr.js — Vercel Serverless Function
// Receives a base64 image from the frontend, calls Gemini Vision API,
// returns structured diary data (date, activities, review).

module.exports = async function handler(req, res) {
    // CORS headers so the static frontend can call this
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable not set in Vercel.' });
    }

    try {
        const { imageBase64, mimeType } = req.body;
        if (!imageBase64) return res.status(400).json({ error: 'No image provided.' });

        // ── Prompt: tells Gemini exactly what to extract ──────────────────────
        const prompt = `You are reading a handwritten personal diary page. Your job is to extract every piece of information visible and return it as a single valid JSON object — no markdown fences, no explanation, just the JSON.

Use this exact structure:
{
  "date": "YYYY-MM-DD",
  "activities": [
    {
      "time": "HH:MM",
      "activity": "clean activity description",
      "duration": "e.g. 30 min or 1 hour, empty string if not shown",
      "category": "spiritual | skills | health | general"
    }
  ],
  "review": "any reflection, summary or notes at the bottom of the page"
}

Category rules — assign the best match:
• spiritual  → prayer, bible, devotion, fasting, worship, praise, meditation, church, scripture
• skills     → reading, learning, coding, study, practice, guitar, writing, course, book, research
• health     → exercise, water, food, eating, sleep, gym, run, walk, yoga, workout, steps
• general    → anything that does not fit the above

Important:
- Extract EVERY activity line you can read, even if partially legible
- Clean up handwriting errors using context clues
- If the date is not visible, use today's date: ${new Date().toISOString().slice(0, 10)}
- Return times in 24-hour HH:MM format
- "review" should be the full reflection text, or empty string if none
- Return ONLY the raw JSON object, nothing else`;

        // ── Call Gemini 1.5 Flash ─────────────────────────────────────────────
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } }
                        ]
                    }],
                    generationConfig: {
                        temperature:     0.1,   // low temp = more precise extraction
                        maxOutputTokens: 2048
                    }
                })
            }
        );

        if (!geminiRes.ok) {
            const errBody = await geminiRes.text();
            console.error('Gemini API error:', errBody);
            return res.status(502).json({ error: 'Gemini API error: ' + geminiRes.status, detail: errBody });
        }

        const geminiData = await geminiRes.json();
        const rawText    = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // ── Parse JSON from Gemini's response ────────────────────────────────
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON found in Gemini response:', rawText);
            return res.status(502).json({ error: 'Gemini returned unexpected format.', raw: rawText });
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // ── Validate & normalise output ───────────────────────────────────────
        const validCats = ['spiritual', 'skills', 'health', 'general'];
        if (parsed.activities) {
            parsed.activities = parsed.activities.map(a => ({
                time:     a.time     || '',
                activity: a.activity || '',
                duration: a.duration || '',
                category: validCats.includes(a.category) ? a.category : 'general'
            }));
        } else {
            parsed.activities = [];
        }
        if (!parsed.date)   parsed.date   = new Date().toISOString().slice(0, 10);
        if (!parsed.review) parsed.review = '';

        return res.status(200).json(parsed);

    } catch (err) {
        console.error('OCR handler error:', err);
        return res.status(500).json({ error: err.message });
    }
};
