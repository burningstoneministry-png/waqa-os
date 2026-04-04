// ocr.js — OCR pipeline
// Primary:  Gemini 1.5 Flash Vision  (via /api/ocr serverless function)
// Fallback: Tesseract.js             (runs locally in browser)

const ocr = {
    spiritualKeywords: ['prayer','bible','devotion','fasting','worship','praise','spiritual','meditation','church','psalm','gospel','scripture'],
    skillsKeywords:    ['book','reading','learning','code','python','skill','practice','course','lesson','study','pages','guitar','writing','javascript','programming','class','tutorial','research'],
    healthKeywords:    ['water','food','eat','exercise','training','run','gym','sleep','rest','walk','yoga','nutrition','workout','jog','swim','diet','steps'],

    categorizeActivity(text) {
        const lower = text.toLowerCase();
        if (this.spiritualKeywords.some(k => lower.includes(k))) return 'spiritual';
        if (this.skillsKeywords.some(k => lower.includes(k)))    return 'skills';
        if (this.healthKeywords.some(k => lower.includes(k)))    return 'health';
        return 'general';
    },

    // ── Gemini Vision (primary) ───────────────────────────────────────────────
    async processImageWithGemini(file, onStatus) {
        onStatus('🤖 Sending to Gemini AI…');
        const resizedBlob = await this._resizeImage(file, 1024);
        const base64      = await this._blobToBase64(resizedBlob);
        const mimeType    = resizedBlob.type || 'image/jpeg';

        const res = await fetch('/api/ocr', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ imageBase64: base64, mimeType })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(err.error || 'Gemini API call failed (' + res.status + ')');
        }

        const data = await res.json();
        onStatus('✅ Gemini extraction complete!');
        return data;
    },

    // ── Tesseract fallback ────────────────────────────────────────────────────
    async processImageWithTesseract(file, onProgress) {
        if (typeof Tesseract === 'undefined') throw new Error('Tesseract not loaded');
        const result     = await Tesseract.recognize(file, 'eng', { logger: m => onProgress(m) });
        const text       = result.data.text;
        const date       = this.extractDate(text);
        const activities = this.extractActivities(text);
        return { date, activities, review: '', rawText: text };
    },

    // ── Main entry — tries Gemini first, auto-falls back to Tesseract ─────────
    async processImage(file, { onStatus, onProgress } = {}) {
        const _status   = onStatus   || (msg => console.log(msg));
        const _progress = onProgress || (p   => console.log(p));

        try {
            const data = await this.processImageWithGemini(file, _status);
            data.activities = (data.activities || []).map(a => ({
                ...a,
                category: a.category || this.categorizeActivity(a.activity)
            }));
            return data;
        } catch (geminiErr) {
            console.warn('Gemini failed — falling back to Tesseract:', geminiErr.message);
            _status('⚠️ Gemini unavailable — using Tesseract fallback…');
            const data = await this.processImageWithTesseract(file, _progress);
            data.activities = (data.activities || []).map(a => ({
                ...a,
                category: a.category || this.categorizeActivity(a.activity)
            }));
            return data;
        }
    },

    // ── Tesseract text helpers ────────────────────────────────────────────────
    extractDate(text) {
        const monthMap = { january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',july:'07',august:'08',september:'09',october:'10',november:'11',december:'12' };
        const patterns = [
            /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
            /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i,
            /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i
        ];
        for (const p of patterns) {
            const m = text.match(p);
            if (m) {
                if (p.source.includes('january')) {
                    if (isNaN(parseInt(m[1]))) return `${m[3]}-${monthMap[m[1].toLowerCase()]}-${String(m[2]).padStart(2,'0')}`;
                    else                        return `${m[3]}-${monthMap[m[2].toLowerCase()]}-${String(m[1]).padStart(2,'0')}`;
                } else if (m[1].length === 4) {
                    return `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
                } else {
                    return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
                }
            }
        }
        return new Date().toISOString().slice(0, 10);
    },

    extractActivities(text) {
        const lines           = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
        const activities      = [];
        const timePattern     = /^(\d{1,2}:\d{2})\s*(am|pm)?\s*[-–]?\s*/i;
        const durationPattern = /(\d+)\s*(min|mins|minutes|hr|hrs|hours|pages?|liters?|km|miles?)/i;

        for (const line of lines) {
            const timeMatch  = line.match(timePattern);
            let time         = '';
            let activityText = line;
            if (timeMatch) { time = timeMatch[1]; activityText = line.replace(timeMatch[0], '').trim(); }
            if (activityText.length < 3) continue;
            const durationMatch = activityText.match(durationPattern);
            activities.push({
                time,
                activity: activityText,
                duration: durationMatch ? durationMatch[0] : '',
                category: this.categorizeActivity(activityText)
            });
        }
        return activities;
    },

    // ── Image resize + base64 helpers ─────────────────────────────────────────
    _resizeImage(file, maxPx) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                let { width, height } = img;
                if (width > maxPx || height > maxPx) {
                    if (width > height) { height = Math.round(height * maxPx / width);  width  = maxPx; }
                    else                { width  = Math.round(width  * maxPx / height); height = maxPx; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.92);
            };
            img.onerror = reject;
            img.src = url;
        });
    },

    _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader  = new FileReader();
            reader.onload  = e => resolve(e.target.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
};
