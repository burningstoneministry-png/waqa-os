// storage.js - Supabase data management

const SUPABASE_URL = 'https://fftvgsiknzcylizhwarh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdHZnc2lrbnpjeWxpemh3YXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjUwOTgsImV4cCI6MjA5MDAwMTA5OH0.QiDoDgqLDT495J4ilUzak1E7MMv3IEl2H4FVSpMN2tQ';

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
            review:     row.review     || '',
            savedAt:    row.saved_at
        };
    },

    _toRows(obj) {
        return Object.values(obj).map(e => ({
            date:       e.date,
            activities: e.activities || [],
            review:     e.review     || '',
            saved_at:   e.savedAt    || new Date().toISOString()
        }));
    },

    // ── CRUD ─────────────────────────────────────────────────────────────────
    async saveEntry(date, entry) {
        const { data, error } = await this.client
            .from('diary_entries')
            .upsert({
                date,
                activities: entry.activities || [],
                review:     entry.review     || '',
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
    }
};
