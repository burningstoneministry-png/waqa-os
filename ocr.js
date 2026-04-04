// ocr.js - Photo OCR extraction using Tesseract.js

const ocr = {
    spiritualKeywords: ['prayer', 'bible', 'devotion', 'fasting', 'worship', 'praise', 'spiritual', 'meditation', 'church', 'psalm', 'gospel'],
    skillsKeywords: ['book', 'reading', 'learning', 'code', 'python', 'skill', 'practice', 'course', 'lesson', 'study', 'pages', 'guitar', 'writing', 'javascript', 'programming', 'class', 'tutorial'],
    healthKeywords: ['water', 'food', 'eat', 'exercise', 'training', 'run', 'gym', 'sleep', 'rest', 'walk', 'yoga', 'nutrition', 'workout', 'jog', 'swim', 'diet'],

    categorizeActivity(text) {
        const lower = text.toLowerCase();
        if (this.spiritualKeywords.some(k => lower.includes(k))) return 'spiritual';
        if (this.skillsKeywords.some(k => lower.includes(k))) return 'skills';
        if (this.healthKeywords.some(k => lower.includes(k))) return 'health';
        return 'general';
    },

    extractDate(text) {
        const patterns = [
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
            /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
            /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i,
            /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i
        ];
        const monthMap = { january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12' };

        for (const p of patterns) {
            const m = text.match(p);
            if (m) {
                if (p.source.includes('january')) {
                    if (isNaN(parseInt(m[1]))) {
                        // Month first
                        return `${m[3]}-${monthMap[m[1].toLowerCase()]}-${String(m[2]).padStart(2, '0')}`;
                    } else {
                        // Day first
                        return `${m[3]}-${monthMap[m[2].toLowerCase()]}-${String(m[1]).padStart(2, '0')}`;
                    }
                } else if (m[1].length === 4) {
                    return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
                } else {
                    return `${m[3]}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
                }
            }
        }
        return new Date().toISOString().slice(0, 10);
    },

    extractActivities(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
        const activities = [];
        const timePattern = /^(\d{1,2}:\d{2})\s*(am|pm)?\s*[-–]?\s*/i;
        const durationPattern = /(\d+)\s*(min|mins|minutes|hr|hrs|hours|pages?|liters?|km|miles?)/i;

        for (const line of lines) {
            const timeMatch = line.match(timePattern);
            let time = '';
            let activityText = line;

            if (timeMatch) {
                time = timeMatch[1];
                activityText = line.replace(timeMatch[0], '').trim();
            }

            if (activityText.length < 3) continue;

            const durationMatch = activityText.match(durationPattern);
            const duration = durationMatch ? durationMatch[0] : '';
            const category = this.categorizeActivity(activityText);

            activities.push({ time, activity: activityText, duration, category });
        }
        return activities;
    },

    async processImage(file) {
        return new Promise((resolve, reject) => {
            if (typeof Tesseract === 'undefined') {
                reject(new Error('Tesseract.js not loaded'));
                return;
            }

            const updateProgress = (p) => {
                const bar = document.getElementById('ocr-progress-bar');
                const status = document.getElementById('ocr-status');
                if (bar) bar.style.width = (p.progress * 100) + '%';
                if (status) status.textContent = p.status || 'Processing...';
            };

            Tesseract.recognize(file, 'eng', { logger: updateProgress })
                .then(({ data: { text } }) => {
                    const date = this.extractDate(text);
                    const activities = this.extractActivities(text);
                    resolve({ text, date, activities });
                })
                .catch(reject);
        });
    },

    formatExtractedData(data) {
        return {
            date: data.date,
            activities: data.activities,
            rawText: data.text
        };
    }
};
