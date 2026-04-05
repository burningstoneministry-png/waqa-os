// storage.js - Supabase data management

const SUPABASE_URL = 'https://vwnflckbvabkiaeadkqa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bmZsY2tidmFia2lhZWFka3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNDU2NjMsImV4cCI6MjA5MDkyMTY2M30.-OyWacv6jfQvsP6z--BD1_QC1pFtW0-ounPCD4dSYTE';

const storage = {
    client: null,

    init() {
        this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialised');
    },

    // ── Helpers ──────────────────────────────────────────────────────────────
    _toEntry(row) {
        if (!row) return null;
        return {
            date:       row.date,
            activities: row.activities || [],
            food:       row.food       || { breakfast: '', lunch: '', dinner: '', snacks: '', water: '' },
            finances:   row.finances   || { expenses: [], income: [], bankBalance: '' },
            review:     row.review     || '',
            savedAt:    row.saved_at
        };
    },

    _toRows(obj) {
        return Object.values(obj).map(e => ({
            date:       e.date,
            activities: e.activities || [],
            food:       e.food       || { breakfast: '', lunch: '', dinner: '', snacks: '', water: '' },
            finances:   e.finances   || { expenses: [], income: [], bankBalance: '' },
            review:     e.review     || '',
            saved_at:   e.savedAt    || new Date().toISOString()
        }));
    },

    // ── CRUD ─────────────────────────────────────────────────────────────────

    /**
     * saveEntry: APPENDS new activities to any existing ones for this date.
     * Food and finances REPLACE (latest entry wins — these are not accumulated).
     * The review text is replaced with the latest value.
     */
    async saveEntry(date, entry) {
        const existing = await this.getEntry(date);
        const existingActivities = (existing && existing.activities) ? existing.activities : [];

        // Activities accumulate; food + finances + review replace
        const mergedActivities = [...existingActivities, ...(entry.activities || [])];

        // Only replace food/finances if new values were actually provided
        const food     = (entry.food     && Object.values(entry.food).some(v => v !== '' && v !== undefined))
                            ? entry.food
                            : (existing ? existing.food : { breakfast: '', lunch: '', dinner: '', snacks: '', water: '' });
        const finances = (entry.finances && (entry.finances.bankBalance !== '' || (entry.finances.expenses && entry.finances.expenses.length > 0)))
                            ? entry.finances
                            : (existing ? existing.finances : { expenses: [], bankBalance: '' });

        const { data, error } = await this.client
            .from('diary_entries')
            .upsert({
                date,
                activities: mergedActivities,
                food,
                finances,
                review:     entry.review || (existing ? existing.review : '') || '',
                saved_at:   new Date().toISOString()
            }, { onConflict: 'date' })
            .select();
        if (error) { console.error('saveEntry error:', error); return null; }
        return this._toEntry(data[0]);
    },

    async getEntry(date) {
        const { data, error } = await this.client
            .from('diary_entries')
            .select('*')
            .eq('date', date)
            .maybeSingle();
        if (error) { console.error('getEntry error:', error); return null; }
        return this._toEntry(data);
    },

    async getAllEntries() {
        const { data, error } = await this.client
            .from('diary_entries')
            .select('*')
            .order('date', { ascending: false });
        if (error) { console.error('getAllEntries error:', error); return {}; }
        const result = {};
        data.forEach(row => { result[row.date] = this._toEntry(row); });
        return result;
    },

    async getEntriesInRange(startDate, endDate) {
        const { data, error } = await this.client
            .from('diary_entries')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });
        if (error) { console.error('getEntriesInRange error:', error); return {}; }
        const result = {};
        data.forEach(row => { result[row.date] = this._toEntry(row); });
        return result;
    },

    async getWeekEntries() {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        return this.getEntriesInRange(
            start.toISOString().slice(0, 10),
            today.toISOString().slice(0, 10)
        );
    },

    async getMonthEntries() {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        return this.getEntriesInRange(
            start.toISOString().slice(0, 10),
            today.toISOString().slice(0, 10)
        );
    },

    async getYearEntries(year) {
        const y     = year || new Date().getFullYear();
        const start = `${y}-01-01`;
        const end   = `${y}-12-31`;
        return this.getEntriesInRange(start, end);
    },

    async getAvailableYears() {
        const { data, error } = await this.client
            .from('diary_entries')
            .select('date')
            .order('date', { ascending: true });
        if (error || !data) return [new Date().getFullYear()];
        const years = [...new Set(data.map(r => parseInt(r.date.slice(0, 4), 10)))];
        return years.length > 0 ? years : [new Date().getFullYear()];
    },

    async deleteEntry(date) {
        const { error } = await this.client
            .from('diary_entries')
            .delete()
            .eq('date', date);
        if (error) console.error('deleteEntry error:', error);
    },

    async exportData() {
        const all = await this.getAllEntries();
        return JSON.stringify(all, null, 2);
    },

    async importData(jsonData) {
        try {
            const parsed = JSON.parse(jsonData);
            const rows   = this._toRows(parsed);
            const { error } = await this.client
                .from('diary_entries')
                .upsert(rows, { onConflict: 'date' });
            if (error) { console.error('importData error:', error); return false; }
            return true;
        } catch (e) {
            console.error('importData parse error:', e);
            return false;
        }
    },

    // ── Chat history (localStorage) ───────────────────────────────────────────
    getChatHistory() {
        try {
            const raw = localStorage.getItem('ai_coach_history');
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    },

    saveChatHistory(messages) {
        // Keep last 50 messages only
        const trimmed = messages.slice(-50);
        localStorage.setItem('ai_coach_history', JSON.stringify(trimmed));
    },

    clearChatHistory() {
        localStorage.removeItem('ai_coach_history');
    },

    // ── Activity Presets ─────────────────────────────────────────────────────
    getPresets() {
        try {
            const raw = localStorage.getItem('activity_presets');
            return raw ? JSON.parse(raw) : this._defaultPresets();
        } catch (e) {
            return this._defaultPresets();
        }
    },

    savePresets(presets) {
        localStorage.setItem('activity_presets', JSON.stringify(presets));
    },

    addPreset(name, category) {
        const presets = this.getPresets();
        const trimmed = name.trim();
        if (!trimmed) return false;
        if (presets.find(p => p.name.toLowerCase() === trimmed.toLowerCase())) return false;
        presets.push({ name: trimmed, category: category || 'skills' });
        this.savePresets(presets);
        return true;
    },

    removePreset(name) {
        const presets = this.getPresets().filter(p => p.name !== name);
        this.savePresets(presets);
    },

    _defaultPresets() {
        return [
            { name: 'Prayer',        category: 'spiritual' },
            { name: 'Bible Study',   category: 'spiritual' },
            { name: 'Devotion',      category: 'spiritual' },
            { name: 'Fasting',       category: 'spiritual' },
            { name: 'Worship',       category: 'spiritual' },
            { name: 'Sermon Prep',   category: 'spiritual' },
            { name: 'Exercise',      category: 'health'    },
            { name: 'Base Training', category: 'health'    },
            { name: 'Walking',       category: 'health'    },
            { name: 'Reading',       category: 'skills'    },
            { name: 'Study',         category: 'skills'    },
            { name: 'Coding',        category: 'skills'    },
        ];
    }
};
