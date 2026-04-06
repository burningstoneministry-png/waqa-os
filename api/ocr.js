// api/ocr.js — Vercel Serverless Function
// Calls Gemini 1.5 Flash Vision with Waqa's diary-specific format guide.
// Returns structured diary data: { date, activities[], review }

const fs   = require('fs');
const path = require('path');

// Load Waqa's diary format guide — sent to Gemini on every request
const DIARY_FORMAT = fs.readFileSync(
    path.join(__dirname, '..', 'diary_format.md'),
    'utf8'
);

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not set in Vercel environment variables.' });
    }

    try {
        const { imageBase64, mimeType, type, prompt: commentaryPrompt } = req.body;

        // ── AI Commentary mode (text-only, no image) ──────────────────────────
        if (type === 'commentary' && commentaryPrompt) {
            const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: commentaryPrompt }]
                        }],
                        generationConfig: {
                            temperature:     0.7,
                            maxOutputTokens: 512
                        }
                    })
                }
            );
            if (!geminiRes.ok) {
                const errBody = await geminiRes.text();
                console.error('Gemini commentary error:', errBody);
                return res.status(502).json({ commentary: null, error: errBody });
            }
            const data = await geminiRes.json();
            const commentary = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
            return res.status(200).json({ commentary });
        }

        if (!imageBase64) return res.status(400).json({ error: 'No image provided.' });

        // ── Build prompt from Waqa's personal diary format guide ─────────────
        const prompt = `You are reading a handwritten diary page belonging to Waqa Atunaise.
You have been given a detailed format guide that explains exactly how his diary is structured,
what to extract, and what to ignore. Follow it precisely.

TODAY'S DATE (use if date not legible): ${new Date().toISOString().slice(0, 10)}

=== WAQA'S DIARY FORMAT GUIDE ===
${DIARY_FORMAT}
=== END OF FORMAT GUIDE ===

Now read the diary image provided and return ONLY a raw JSON object following the structure
and rules in the guide above. No markdown, no explanation — just the JSON.`;

        // ── Call Gemini 2.0 Flash ─────────────────────────────────────────────
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                        temperature:     0.1,   // low = precise, consistent extraction
                        maxOutputTokens: 4096
                    }
                })
            }
        );

        if (!geminiRes.ok) {
            const errBody = await geminiRes.text();
            console.error('Gemini API error:', errBody);
            return res.status(502).json({ error: 'Gemini API error ' + geminiRes.status, detail: errBody });
        }

        const geminiData = await geminiRes.json();
        const rawText    = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // ── Extract JSON from response ─────────────────────────────────────────
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON in Gemini response:', rawText);
            return res.status(502).json({ error: 'Gemini returned unexpected format.', raw: rawText });
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // ── Validate & normalise ───────────────────────────────────────────────
        const validCats = ['spiritual', 'skills', 'health', 'general'];
        parsed.activities = (parsed.activities || []).map(a => ({
            time:     (a.time     || '').trim(),
            activity: (a.activity || '').trim(),
            duration: (a.duration || '').trim(),
            category: validCats.includes(a.category) ? a.category : 'general'
        }));
        if (!parsed.date)   parsed.date   = new Date().toISOString().slice(0, 10);
        if (!parsed.review) parsed.review = '';

        return res.status(200).json(parsed);

    } catch (err) {
        console.error('OCR handler error:', err);
        return res.status(500).json({ error: err.message });
    }
};
