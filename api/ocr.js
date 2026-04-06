// api/ocr.js — Vercel Serverless Function
// Uses Groq API for AI commentary (chatbot) and OCR (vision).

const fs   = require('fs');
const path = require('path');

const DIARY_FORMAT = fs.readFileSync(
    path.join(__dirname, '..', 'diary_format.md'),
    'utf8'
);

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'GROQ_API_KEY not set in Vercel environment variables.' });
    }

    try {
        const { imageBase64, mimeType, type, prompt: commentaryPrompt } = req.body;

        // ── AI Commentary / Chatbot mode (text-only) ──────────────────────────
        if (type === 'commentary' && commentaryPrompt) {
            const groqRes = await fetch(GROQ_API_URL, {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model:       'llama-3.3-70b-versatile',
                    messages:    [{ role: 'user', content: commentaryPrompt }],
                    temperature: 0.7,
                    max_tokens:  512
                })
            });

            if (!groqRes.ok) {
                const errBody = await groqRes.text();
                console.error('Groq commentary error:', errBody);
                return res.status(502).json({ commentary: null, error: errBody });
            }

            const data = await groqRes.json();
            const commentary = data?.choices?.[0]?.message?.content || null;
            return res.status(200).json({ commentary });
        }

        if (!imageBase64) return res.status(400).json({ error: 'No image provided.' });

        // ── OCR / Vision mode (image + text) ──────────────────────────────────
        const prompt = `You are reading a handwritten diary page belonging to Waqa Atunaise.
You have been given a detailed format guide that explains exactly how his diary is structured,
what to extract, and what to ignore. Follow it precisely.

TODAY'S DATE (use if date not legible): ${new Date().toISOString().slice(0, 10)}

=== WAQA'S DIARY FORMAT GUIDE ===
${DIARY_FORMAT}
=== END OF FORMAT GUIDE ===

Now read the diary image provided and return ONLY a raw JSON object following the structure
and rules in the guide above. No markdown, no explanation — just the JSON.`;

        const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;

        const groqRes = await fetch(GROQ_API_URL, {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model:      'llama-3.2-11b-vision-preview',
                messages:   [{
                    role:    'user',
                    content: [
                        { type: 'text',      text:      prompt },
                        { type: 'image_url', image_url: { url: dataUrl } }
                    ]
                }],
                temperature: 0.1,
                max_tokens:  4096
            })
        });

        if (!groqRes.ok) {
            const errBody = await groqRes.text();
            console.error('Groq OCR error:', errBody);
            return res.status(502).json({ error: 'Groq API error ' + groqRes.status, detail: errBody });
        }

        const groqData = await groqRes.json();
        const rawText  = groqData?.choices?.[0]?.message?.content || '';

        // ── Extract JSON from response ─────────────────────────────────────────
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON in Groq response:', rawText);
            return res.status(502).json({ error: 'Groq returned unexpected format.', raw: rawText });
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
