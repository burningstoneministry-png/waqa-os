// app.js - Main application logic

let activityCount  = 0;
let expenseCount   = 0;
let incomeCount    = 0;
let currentTab     = 'write';
let extractedOcrData  = null;
let aiCoachOpen       = false;
let yearlyAllEntries  = {};   // cache for yearly data
let yearlyActiveMonth = 'all';
let yearlyActiveFilter = 'all';

// ─── Baselines ────────────────────────────────────────────────────────────────
const BASELINES = {
    prayer:            120,   // 2hrs/day (mins)
    bibleStudy:        30,    // 30mins/day
    bookPages:         20,    // 20 pages/day
    water:             1500,  // 1.5L/day (ml)
    exercise:          30,    // 30mins/day
    coding:            3,     // 3 sessions/week
    fasting:           3,     // 3 days/month
    baseTraining:      3,     // 3 sessions/week
    diaryWeek:         5,     // 5 logs/week
    diaryMonth:        20,    // 20 logs/month
};

// ─── Duration Parser ──────────────────────────────────────────────────────────
function parseDurationToMins(str) {
    if (!str || typeof str !== 'string') return 0;
    const s = str.trim().toLowerCase();
    let mins = 0;
    const hrMatch  = s.match(/(\d+)\s*hrs?/);
    if (hrMatch)  mins += parseInt(hrMatch[1], 10) * 60;
    const minMatch = s.match(/(\d+)\s*mins?/);
    if (minMatch) mins += parseInt(minMatch[1], 10);
    return mins;
}

function minsToDisplay(totalMins) {
    if (!totalMins || totalMins <= 0) return '—';
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h === 0) return `${m}mins`;
    if (m === 0) return h === 1 ? `1hr` : `${h}hrs`;
    return h === 1 ? `1hr ${m}mins` : `${h}hrs ${m}mins`;
}

function baselinePct(actual, baseline) {
    if (!baseline) return 0;
    return Math.round((actual / baseline) * 100);
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '—';
    return '$' + parseFloat(amount).toFixed(2);
}

// ─── Daily Scripture ──────────────────────────────────────────────────────────
const SCRIPTURES = [
    { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13 (NKJV)" },
    { text: "For with God nothing will be impossible.", ref: "Luke 1:37 (NKJV)" },
    { text: "But those who wait on the LORD shall renew their strength.", ref: "Isaiah 40:31 (NKJV)" },
    { text: "With men this is impossible, but with God all things are possible.", ref: "Matthew 19:26 (NKJV)" },
    { text: "Now to Him who is able to do exceedingly abundantly above all that we ask or think.", ref: "Ephesians 3:20 (NKJV)" },
    { text: "Commit your works to the LORD, and your thoughts will be established.", ref: "Proverbs 16:3 (NKJV)" },
    { text: "For I know the thoughts that I think toward you, says the LORD, thoughts of peace and not of evil.", ref: "Jeremiah 29:11 (NKJV)" },
    { text: "Ask, and it will be given to you; seek, and you will find; knock, and it will be opened to you.", ref: "Matthew 7:7 (NKJV)" },
    { text: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.", ref: "2 Timothy 1:7 (NKJV)" },
    { text: "And my God shall supply all your need according to His riches in glory by Christ Jesus.", ref: "Philippians 4:19 (NKJV)" },
    { text: "Be strong and of good courage; do not be afraid, for the LORD your God is with you.", ref: "Joshua 1:9 (NKJV)" },
    { text: "Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers.", ref: "3 John 1:2 (NKJV)" },
    { text: "Trust in the LORD with all your heart, and lean not on your own understanding.", ref: "Proverbs 3:5 (NKJV)" },
    { text: "The effective, fervent prayer of a righteous man avails much.", ref: "James 5:16 (NKJV)" },
    { text: "But seek first the kingdom of God and His righteousness, and all these things shall be added to you.", ref: "Matthew 6:33 (NKJV)" },
    { text: "Delight yourself also in the LORD, and He shall give you the desires of your heart.", ref: "Psalm 37:4 (NKJV)" },
    { text: "The LORD is my shepherd; I shall not want.", ref: "Psalm 23:1 (NKJV)" },
    { text: "Now faith is the substance of things hoped for, the evidence of things not seen.", ref: "Hebrews 11:1 (NKJV)" },
    { text: "What then shall we say to these things? If God is for us, who can be against us?", ref: "Romans 8:31 (NKJV)" },
    { text: "And we know that all things work together for good to those who love God.", ref: "Romans 8:28 (NKJV)" },
    { text: "The plans of the diligent lead surely to plenty.", ref: "Proverbs 21:5 (NKJV)" },
    { text: "Let your light so shine before men, that they may see your good works.", ref: "Matthew 5:16 (NKJV)" },
    { text: "Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving.", ref: "Philippians 4:6 (NKJV)" },
    { text: "The LORD is my light and my salvation; whom shall I fear?", ref: "Psalm 27:1 (NKJV)" },
];

function loadDailyScripture() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const s = SCRIPTURES[dayOfYear % SCRIPTURES.length];
    const textEl = document.getElementById('scripture-text');
    const refEl  = document.getElementById('scripture-ref');
    if (textEl) textEl.textContent = '\u201c' + s.text + '\u201d';
    if (refEl)  refEl.textContent  = '\u2014 ' + s.ref;
}

// ─── Tab Navigation ───────────────────────────────────────────────────────────
function showTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    const btn = document.querySelector(`[onclick="showTab('${tab}')"]`);
    if (btn) btn.classList.add('active');
    if (tab === 'daily')   renderDailySummary();
    if (tab === 'weekly')  renderWeeklyView();
    if (tab === 'monthly') renderMonthlyReview();
    if (tab === 'yearly')  initYearlyReview();
}

// ─── Preset Dropdown ──────────────────────────────────────────────────────────
function buildPresetOptions() {
    return storage.getPresets().map(p =>
        `<div class="preset-option cat-${p.category}" onclick="selectPreset(this,'${p.name.replace(/'/g,"\\'")}','${p.category}')">${p.name}</div>`
    ).join('');
}

function selectPreset(el, name, category) {
    const dropdown = el.closest('.preset-dropdown');
    const row      = dropdown.closest('.activity-row');
    if (!row) return;
    row.querySelector('.act-text').value     = name;
    row.querySelector('.act-category').value = category;
    const id = row.id.replace('activity-', '');
    updateCategoryColor(id, category);
    dropdown.classList.remove('open');
}

function togglePresetDropdown(btn) {
    const row      = btn.closest('.activity-row');
    const dropdown = row.querySelector('.preset-dropdown');
    dropdown.querySelector('.preset-list').innerHTML = buildPresetOptions();
    document.querySelectorAll('.preset-dropdown').forEach(d => { if (d !== dropdown) d.classList.remove('open'); });
    dropdown.classList.toggle('open');
}

document.addEventListener('click', e => {
    if (!e.target.closest('.preset-toggle-btn') && !e.target.closest('.preset-dropdown'))
        document.querySelectorAll('.preset-dropdown').forEach(d => d.classList.remove('open'));
});

// ─── Activity Rows ────────────────────────────────────────────────────────────
function addActivityField(prefill = {}) {
    activityCount++;
    const id  = activityCount;
    const container = document.getElementById('activities-container');
    const div = document.createElement('div');
    div.className = 'activity-row';
    div.id = 'activity-' + id;
    const isReading = (prefill.activity || '').toLowerCase().includes('read') || (prefill.activity || '').toLowerCase().includes('book');
    div.innerHTML = `
        <input type="time" class="act-time" value="${prefill.time || ''}" placeholder="Time">
        <div class="act-text-wrap">
            <input type="text" class="act-text" value="${prefill.activity || ''}" placeholder="Activity..." oninput="autoCategorize(${id}); checkBookFields(${id})">
            <button class="preset-toggle-btn" onclick="togglePresetDropdown(this)" title="Pick saved activity">▾</button>
            <div class="preset-dropdown">
                <div class="preset-list">${buildPresetOptions()}</div>
                <div class="preset-add-row">
                    <input class="preset-add-input" type="text" placeholder="Add new activity...">
                    <button onclick="addNewPresetFromRow(this)">+ Save</button>
                </div>
            </div>
        </div>
        <input type="text" class="act-duration" value="${prefill.duration || ''}" placeholder="e.g. 1hr 30mins">
        <select class="act-category" onchange="updateCategoryColor(${id}, this.value)">
            <option value="spiritual"${prefill.category === 'spiritual' ? ' selected' : ''}>🟠 Spiritual</option>
            <option value="skills"   ${prefill.category === 'skills'    ? ' selected' : ''}>🟢 Skills</option>
            <option value="health"   ${prefill.category === 'health'    ? ' selected' : ''}>🔵 Health</option>
        </select>
        <button class="btn-remove" onclick="removeActivity(${id})">✕</button>
        <div class="book-fields" id="book-fields-${id}" style="display:${isReading ? 'flex' : 'none'}">
            <input type="text"   class="act-book-title"  value="${prefill.bookTitle  || ''}" placeholder="📚 Book title (e.g. Atomic Habits)">
            <input type="number" class="act-book-pages"  value="${prefill.pagesRead  || ''}" placeholder="Pages read" min="0">
            <label class="audio-check-label">
                <input type="checkbox" class="act-audio" ${prefill.isAudio ? 'checked' : ''}> 🎧 Audio
            </label>
        </div>
    `;
    container.appendChild(div);
    updateCategoryColor(id, prefill.category || 'spiritual');
}

function addNewPresetFromRow(btn) {
    const dropdown = btn.closest('.preset-dropdown');
    const input    = dropdown.querySelector('.preset-add-input');
    const name     = input.value.trim();
    if (!name) return;
    const actRow = btn.closest('.activity-row');
    const cat    = actRow ? actRow.querySelector('.act-category').value : 'skills';
    if (storage.addPreset(name, cat)) {
        showToast(`"${name}" saved ✅`, 'success');
        input.value = '';
        dropdown.querySelector('.preset-list').innerHTML = buildPresetOptions();
    } else {
        showToast('Already exists or empty', 'error');
    }
}

function removeActivity(id) {
    const rows = document.querySelectorAll('.activity-row');
    if (rows.length <= 1) {
        const el = document.getElementById('activity-' + id);
        if (el) {
            el.querySelector('.act-time').value     = '';
            el.querySelector('.act-text').value     = '';
            el.querySelector('.act-duration').value = '';
            el.querySelector('.act-category').value = 'spiritual';
            updateCategoryColor(id, 'spiritual');
        }
        return;
    }
    const el = document.getElementById('activity-' + id);
    if (el) el.remove();
}

function autoCategorize(id) {
    const row  = document.getElementById('activity-' + id);
    if (!row) return;
    const text    = row.querySelector('.act-text').value;
    const presets = storage.getPresets();
    const match   = presets.find(p => p.name.toLowerCase() === text.trim().toLowerCase());
    const cat     = match ? match.category : ocr.categorizeActivity(text);
    row.querySelector('.act-category').value = cat;
    updateCategoryColor(id, cat);
}

function checkBookFields(id) {
    const row   = document.getElementById('activity-' + id);
    if (!row) return;
    const text  = row.querySelector('.act-text').value.toLowerCase();
    const panel = document.getElementById('book-fields-' + id);
    if (!panel) return;
    const isReading = text.includes('read') || text.includes('book');
    panel.style.display = isReading ? 'flex' : 'none';
}

function updateCategoryColor(id, category) {
    const row = document.getElementById('activity-' + id);
    if (!row) return;
    row.className = 'activity-row cat-' + category;
}

// ─── Expense Rows ─────────────────────────────────────────────────────────────
function addExpenseRow(prefill = {}) {
    expenseCount++;
    const id        = expenseCount;
    const container = document.getElementById('expenses-container');
    const div       = document.createElement('div');
    div.className   = 'expense-row';
    div.id          = 'expense-' + id;
    div.innerHTML = `
        <input type="text"   class="exp-desc"   value="${prefill.description || ''}" placeholder="Description (e.g. Groceries)">
        <div class="currency-input-wrap small">
            <span class="currency-symbol">$</span>
            <input type="number" class="exp-amount" value="${prefill.amount || ''}" placeholder="0.00" min="0" step="0.01">
        </div>
        <button class="btn-remove" onclick="removeExpenseRow(${id})">✕</button>
    `;
    container.appendChild(div);
}

function removeExpenseRow(id) {
    const rows = document.querySelectorAll('.expense-row');
    if (rows.length <= 1) {
        const el = document.getElementById('expense-' + id);
        if (el) {
            el.querySelector('.exp-desc').value   = '';
            el.querySelector('.exp-amount').value = '';
        }
        return;
    }
    const el = document.getElementById('expense-' + id);
    if (el) el.remove();
}

function collectExpenses() {
    const rows = document.querySelectorAll('.expense-row');
    const expenses = [];
    rows.forEach(row => {
        const desc   = row.querySelector('.exp-desc').value.trim();
        const amount = parseFloat(row.querySelector('.exp-amount').value);
        if (desc && !isNaN(amount) && amount > 0) {
            expenses.push({ description: desc, amount });
        }
    });
    return expenses;
}

function collectFood() {
    return {
        breakfast: document.getElementById('food-breakfast').value.trim(),
        lunch:     document.getElementById('food-lunch').value.trim(),
        dinner:    document.getElementById('food-dinner').value.trim(),
        snacks:    document.getElementById('food-snacks').value.trim(),
        water:     document.getElementById('food-water').value.trim(),
    };
}

// ─── Income Rows ──────────────────────────────────────────────────────────────
function addIncomeRow(prefill = {}) {
    incomeCount++;
    const id        = incomeCount;
    const container = document.getElementById('income-container');
    const div       = document.createElement('div');
    div.className   = 'expense-row';
    div.id          = 'income-' + id;
    div.innerHTML = `
        <input type="text"   class="exp-desc"   value="${prefill.description || ''}" placeholder="Source (e.g. Church Offering)">
        <div class="currency-input-wrap small">
            <span class="currency-symbol">$</span>
            <input type="number" class="exp-amount" value="${prefill.amount || ''}" placeholder="0.00" min="0" step="0.01">
        </div>
        <button class="btn-remove" onclick="removeIncomeRow(${id})">✕</button>
    `;
    container.appendChild(div);
}

function removeIncomeRow(id) {
    const rows = document.querySelectorAll('#income-container .expense-row');
    if (rows.length <= 1) {
        const el = document.getElementById('income-' + id);
        if (el) { el.querySelector('.exp-desc').value = ''; el.querySelector('.exp-amount').value = ''; }
        return;
    }
    const el = document.getElementById('income-' + id);
    if (el) el.remove();
}

function collectIncome() {
    const rows   = document.querySelectorAll('#income-container .expense-row');
    const income = [];
    rows.forEach(row => {
        const desc   = row.querySelector('.exp-desc').value.trim();
        const amount = parseFloat(row.querySelector('.exp-amount').value);
        if (desc && !isNaN(amount) && amount > 0) income.push({ description: desc, amount });
    });
    return income;
}

// ─── Save Entry ───────────────────────────────────────────────────────────────
async function saveEntry() {
    const date = document.getElementById('entry-date').value;
    if (!date) { showToast('Please select a date', 'error'); return; }

    const rows       = document.querySelectorAll('.activity-row');
    const activities = [];
    rows.forEach(row => {
        const text = row.querySelector('.act-text').value.trim();
        if (!text) return;
        const actId      = row.id.replace('activity-', '');
        const bookFields = document.getElementById('book-fields-' + actId);
        const act = {
            time:     row.querySelector('.act-time').value,
            activity: text,
            duration: row.querySelector('.act-duration').value.trim(),
            category: row.querySelector('.act-category').value
        };
        if (bookFields && bookFields.style.display !== 'none') {
            act.bookTitle  = bookFields.querySelector('.act-book-title').value.trim();
            act.pagesRead  = parseInt(bookFields.querySelector('.act-book-pages').value) || 0;
            act.isAudio    = bookFields.querySelector('.act-audio').checked;
        }
        activities.push(act);
    });

    const food     = collectFood();
    const expenses = collectExpenses();
    const income   = collectIncome();
    const balance  = document.getElementById('finance-balance').value;
    const finances = { expenses, income, bankBalance: balance ? parseFloat(balance) : '' };
    const review   = document.getElementById('daily-review').value;

    showToast('Saving…', 'info');
    const saved = await storage.saveEntry(date, { activities, food, finances, review });
    if (saved) {
        showToast('Entry saved ✅', 'success');
        resetForm();
    } else {
        showToast('Save failed — check console', 'error');
    }
}

function resetForm() {
    document.getElementById('activities-container').innerHTML = '';
    document.getElementById('expenses-container').innerHTML  = '';
    document.getElementById('income-container').innerHTML    = '';
    document.getElementById('daily-review').value     = '';
    document.getElementById('food-breakfast').value   = '';
    document.getElementById('food-lunch').value       = '';
    document.getElementById('food-dinner').value      = '';
    document.getElementById('food-snacks').value      = '';
    document.getElementById('food-water').value       = '';
    document.getElementById('finance-balance').value  = '';
    activityCount = 0;
    expenseCount  = 0;
    incomeCount   = 0;
    addActivityField();
    addExpenseRow();
    addIncomeRow();
    document.getElementById('entry-date').value = new Date().toISOString().slice(0, 10);
    window._editingFullList = null;
}

// ─── Load existing entry for selected date ────────────────────────────────────
async function loadEntryForDate() {
    const date = document.getElementById('entry-date').value;
    if (!date) return;

    document.getElementById('activities-container').innerHTML = '';
    activityCount = 0;
    addActivityField();

    const entry = await storage.getEntry(date);
    if (entry && entry.activities && entry.activities.length > 0) {
        const totalMins = entry.activities.reduce((s, a) => s + parseDurationToMins(a.duration), 0);
        showToast(`${entry.activities.length} activities already saved for ${date} (${minsToDisplay(totalMins)} total).`, 'info');
        let banner = document.getElementById('existing-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'existing-banner';
            banner.className = 'existing-banner';
            document.getElementById('activities-container').before(banner);
        }
        banner.innerHTML = `
            <span>📋 ${entry.activities.length} activities saved for this date. New rows below will be <strong>added</strong> to them.</span>
            <button onclick="loadExistingIntoForm('${date}')">✏️ View & Edit All</button>
        `;
        banner.style.display = 'flex';
    } else {
        const banner = document.getElementById('existing-banner');
        if (banner) banner.style.display = 'none';
    }
}

async function loadExistingIntoForm(date) {
    const entry = await storage.getEntry(date);
    if (!entry) return;
    document.getElementById('activities-container').innerHTML = '';
    activityCount = 0;
    (entry.activities || []).forEach(a => addActivityField(a));
    addActivityField();
    document.getElementById('daily-review').value = entry.review || '';

    // Load food
    if (entry.food) {
        document.getElementById('food-breakfast').value = entry.food.breakfast || '';
        document.getElementById('food-lunch').value     = entry.food.lunch     || '';
        document.getElementById('food-dinner').value    = entry.food.dinner    || '';
        document.getElementById('food-snacks').value    = entry.food.snacks    || '';
        document.getElementById('food-water').value     = entry.food.water     || '';
    }

    // Load finances
    if (entry.finances) {
        document.getElementById('finance-balance').value = entry.finances.bankBalance || '';
        document.getElementById('expenses-container').innerHTML = '';
        document.getElementById('income-container').innerHTML   = '';
        expenseCount = 0;
        incomeCount  = 0;
        (entry.finances.expenses || []).forEach(e => addExpenseRow(e));
        if (!entry.finances.expenses || entry.finances.expenses.length === 0) addExpenseRow();
        (entry.finances.income || []).forEach(i => addIncomeRow(i));
        if (!entry.finances.income || entry.finances.income.length === 0) addIncomeRow();
    }

    window._editingFullList = date;
    showToast('Loaded for editing. Saving will replace the full entry for this date.', 'info');
    const banner = document.getElementById('existing-banner');
    if (banner) banner.innerHTML = `<span>✏️ Editing full entry for ${date}. Saving will <strong>replace</strong> all activities.</span>`;
}

// ─── Aggregate activities ─────────────────────────────────────────────────────
function aggregateActivities(activities) {
    const result = {
        prayerMins: 0, bibleStudyMins: 0, bookPages: 0, waterMl: 0,
        exerciseMins: 0, codingSessions: 0, fastingDays: 0, baseTrainingSessions: 0,
        catMins: { spiritual: 0, skills: 0, health: 0 },
        totalMins: 0,
    };
    (activities || []).forEach(a => {
        const name = (a.activity || '').trim().toLowerCase();
        const mins = parseDurationToMins(a.duration);
        const cat  = a.category || 'spiritual';
        if (result.catMins[cat] !== undefined) result.catMins[cat] += mins;
        result.totalMins += mins;
        if (name.includes('prayer') || name.includes('pray'))              result.prayerMins += mins;
        else if (name.includes('bible') || name.includes('devotion'))      result.bibleStudyMins += mins;
        else if (name.includes('reading') || name.includes('book')) {
            const pg = (a.duration || '').match(/(\d+)\s*(?:pages?|p\b)/i);
            if (pg) result.bookPages += parseInt(pg[1], 10);
        }
        else if (name.includes('exercise') || name.includes('training') || name.includes('walking') || name.includes('walk') || name.includes('gym') || name.includes('workout')) {
            if (name.includes('base training')) result.baseTrainingSessions += 1;
            result.exerciseMins += mins;
        }
        else if (name.includes('coding') || name.includes('code'))        result.codingSessions += 1;
        else if (name.includes('fast') || name.includes('fasting'))       result.fastingDays += 1;
    });
    return result;
}

// Parse water from food entry
function parseWaterMl(waterStr) {
    if (!waterStr) return 0;
    const litreMatch = waterStr.match(/([\d.]+)\s*l/i);
    const mlMatch    = waterStr.match(/([\d.]+)\s*ml/i);
    if (litreMatch) return parseFloat(litreMatch[1]) * 1000;
    if (mlMatch)    return parseFloat(mlMatch[1]);
    return 0;
}

// ─── Finance card helper ──────────────────────────────────────────────────────
function renderFinanceCards(totalSpent, latestBalance) {
    return `
        <div class="finance-mini-card expense-card">
            <span class="fmc-icon">💸</span>
            <div>
                <div class="fmc-label">Spent</div>
                <div class="fmc-value">${formatCurrency(totalSpent)}</div>
            </div>
        </div>
        <div class="finance-mini-card balance-card">
            <span class="fmc-icon">🏦</span>
            <div>
                <div class="fmc-label">Balance</div>
                <div class="fmc-value">${latestBalance !== '' && latestBalance !== undefined ? formatCurrency(latestBalance) : '—'}</div>
            </div>
        </div>
    `;
}

// ─── Baseline row renderer ────────────────────────────────────────────────────
function renderBaselineRow(icon, label, actualDisplay, pct, color, subLabel) {
    const barPct   = Math.min(pct, 100);
    const pctClass = pct >= 100 ? 'baseline-over' : pct >= 50 ? 'pct-mid' : 'pct-low';
    const pctText  = pct >= 100 ? `🎉 ${pct}%` : `${pct}%`;
    return `
        <div class="baseline-row">
            <div class="baseline-header">
                <span class="baseline-icon">${icon}</span>
                <span class="baseline-label">${label}</span>
                <span class="baseline-actual">${actualDisplay}</span>
                <span class="${pctClass} baseline-pct">${pctText}</span>
            </div>
            ${subLabel ? `<div class="baseline-sublabel">${subLabel}</div>` : ''}
            <div class="baseline-track">
                <div class="baseline-fill" style="width:${barPct}%; background:${color};"></div>
            </div>
        </div>
    `;
}

// ─── Category summary cards ───────────────────────────────────────────────────
function renderCategoryCards(catMins, totalMins) {
    const cats = [
        { key: 'spiritual', label: 'Spiritual', icon: '🟠', color: 'var(--color-spiritual)' },
        { key: 'skills',    label: 'Skills',    icon: '🟢', color: 'var(--color-skills)'    },
        { key: 'health',    label: 'Health',    icon: '🔵', color: 'var(--color-health)'    },
    ];
    return `<div class="category-cards">${cats.map(c => {
        const pct = totalMins > 0 ? Math.round((catMins[c.key] / totalMins) * 100) : 0;
        return `
            <div class="cat-summary-card" style="border-top:4px solid ${c.color}">
                <div class="cat-card-icon">${c.icon}</div>
                <div class="cat-card-label">${c.label}</div>
                <div class="cat-card-pct" style="color:${c.color}">${pct}%</div>
                <div class="cat-card-time">${minsToDisplay(catMins[c.key])}</div>
            </div>
        `;
    }).join('')}</div>`;
}

// ─── Gemini AI helper ─────────────────────────────────────────────────────────
async function getAICommentary(prompt) {
    try {
        const res  = await fetch('/api/ocr', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ type: 'commentary', prompt })
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.commentary || null;
    } catch (e) { console.warn('AI commentary unavailable:', e); return null; }
}

// ─── Daily Summary ────────────────────────────────────────────────────────────
async function renderDailySummary() {
    const today     = new Date().toISOString().slice(0, 10);
    const container = document.getElementById('daily-summary-content');
    const finCards  = document.getElementById('daily-finance-cards');
    container.innerHTML = '<div class="empty-state"><span>⏳</span><p>Loading…</p></div>';
    if (finCards) finCards.innerHTML = '';

    const entry = await storage.getEntry(today);
    if (!entry || !entry.activities || entry.activities.length === 0) {
        container.innerHTML = '<div class="empty-state"><span>📭</span><p>No entry for today yet. Write your first diary entry!</p></div>';
        return;
    }

    const agg      = aggregateActivities(entry.activities);
    const food     = entry.food     || {};
    const finances = entry.finances || { expenses: [], bankBalance: '' };
    const waterMl  = parseWaterMl(food.water);
    const totalSpent = (finances.expenses || []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

    // Finance cards in heading
    if (finCards) finCards.innerHTML = renderFinanceCards(totalSpent, finances.bankBalance);

    const prayerPct   = baselinePct(agg.prayerMins,     BASELINES.prayer);
    const biblePct    = baselinePct(agg.bibleStudyMins, BASELINES.bibleStudy);
    const exercisePct = baselinePct(agg.exerciseMins,   BASELINES.exercise);
    const waterPct    = baselinePct(waterMl,            BASELINES.water);

    const hasMeals = food.breakfast || food.lunch || food.dinner || food.snacks;

    container.innerHTML = `
        ${renderCategoryCards(agg.catMins, agg.totalMins)}
        <div class="section-title">📊 Today's Activity Performance</div>
        <div class="baseline-list">
            ${renderBaselineRow('🙏', 'Prayer',      minsToDisplay(agg.prayerMins),     prayerPct,   'var(--color-spiritual)', 'Baseline: 2hrs/day')}
            ${renderBaselineRow('📖', 'Bible Study', minsToDisplay(agg.bibleStudyMins), biblePct,    'var(--color-spiritual)', 'Baseline: 30mins/day')}
            ${renderBaselineRow('💪', 'Exercise',    minsToDisplay(agg.exerciseMins),   exercisePct, 'var(--color-health)',    'Baseline: 30mins/day')}
            ${food.water ? renderBaselineRow('💧', 'Water', food.water, waterPct, 'var(--color-health)', 'Baseline: 1.5L/day') : ''}
            ${renderBaselineRow('📔', 'Diary Update', 'Logged ✓', 100, '#059669', 'Baseline: daily')}
            ${agg.fastingDays > 0 ? renderBaselineRow('🕊️', 'Fasting', `${agg.fastingDays} day(s)`, baselinePct(agg.fastingDays, 3), '#7c3aed', 'Monthly baseline: 3 days') : ''}
        </div>
        ${hasMeals ? `
        <div class="section-title">🍽️ Food Today</div>
        <div class="food-summary-grid">
            ${food.breakfast ? `<div class="food-summary-item"><span class="food-meal-label">🌅 Breakfast</span><span>${food.breakfast}</span></div>` : ''}
            ${food.lunch     ? `<div class="food-summary-item"><span class="food-meal-label">☀️ Lunch</span><span>${food.lunch}</span></div>`         : ''}
            ${food.dinner    ? `<div class="food-summary-item"><span class="food-meal-label">🌙 Dinner</span><span>${food.dinner}</span></div>`        : ''}
            ${food.snacks    ? `<div class="food-summary-item"><span class="food-meal-label">🍎 Snacks</span><span>${food.snacks}</span></div>`        : ''}
        </div>` : ''}
        ${finances.expenses && finances.expenses.length > 0 ? `
        <div class="section-title">💰 Expenses Today</div>
        <div class="expense-summary-list">
            ${finances.expenses.map(e => `
                <div class="expense-summary-row">
                    <span>${e.description}</span>
                    <span class="expense-amount">${formatCurrency(e.amount)}</span>
                </div>
            `).join('')}
            <div class="expense-summary-row total-row">
                <span><strong>Total Spent</strong></span>
                <span class="expense-amount"><strong>${formatCurrency(totalSpent)}</strong></span>
            </div>
        </div>` : ''}
        ${entry.review ? `<div class="review-box"><strong>Reflection:</strong> ${entry.review}</div>` : ''}
        <div class="ai-commentary-box">
            <div class="ai-commentary-header">🤖 AI Daily Coach</div>
            <div id="daily-ai-text" class="ai-commentary-loading">Generating commentary…</div>
        </div>
    `;

    const aiPrompt = [
        `Daily diary for Pastor Fire (${today}):`,
        `Prayer: ${minsToDisplay(agg.prayerMins)} (${prayerPct}% of 2hr baseline)`,
        `Bible Study: ${minsToDisplay(agg.bibleStudyMins)} (${biblePct}%)`,
        `Exercise: ${minsToDisplay(agg.exerciseMins)} (${exercisePct}%)`,
        food.water ? `Water: ${food.water} (${waterPct}%)` : '',
        hasMeals ? `Food: Breakfast="${food.breakfast}", Lunch="${food.lunch}", Dinner="${food.dinner}", Snacks="${food.snacks}"` : '',
        totalSpent > 0 ? `Spent: $${totalSpent.toFixed(2)}` : '',
        finances.bankBalance ? `Bank balance: $${finances.bankBalance}` : '',
        `\nGive a warm 3-4 sentence daily coaching note. Mention prayer performance, food balance if logged, and spending habits if relevant. End with encouragement.`
    ].filter(Boolean).join('\n');

    const commentary = await getAICommentary(aiPrompt);
    const aiEl = document.getElementById('daily-ai-text');
    if (aiEl) {
        aiEl.className   = 'ai-commentary-text';
        aiEl.textContent = commentary || `${prayerPct >= 100 ? '🙏 Full prayer goal hit today — outstanding!' : `🙏 Prayer was ${prayerPct}% of your 2hr target today.`} ${hasMeals ? 'Food is logged — aim for balance across all meals.' : 'Log your meals to get food analysis.'} Keep showing up every day — consistency is the key to transformation!`;
    }
}

// ─── Weekly View ──────────────────────────────────────────────────────────────
async function renderWeeklyView() {
    const container = document.getElementById('weekly-content');
    const finCards  = document.getElementById('weekly-finance-cards');
    container.innerHTML = '<div class="empty-state"><span>⏳</span><p>Loading…</p></div>';
    if (finCards) finCards.innerHTML = '';

    const entries  = await storage.getWeekEntries();
    const days     = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    const weekAgg = {
        prayerMins: 0, bibleStudyMins: 0, exerciseMins: 0, waterMl: 0,
        codingSessions: 0, fastingDays: 0, baseTrainingSessions: 0,
        diaryDays: 0, catMins: { spiritual: 0, skills: 0, health: 0 }, totalMins: 0,
    };
    let weekSpent = 0;
    let latestBalance = '';

    let gridHtml = '<div class="week-grid">';
    days.forEach(day => {
        const entry   = entries[day];
        const d       = new Date(day + 'T00:00:00');
        const isToday = day === new Date().toISOString().slice(0, 10);
        const hasEntry= entry && entry.activities && entry.activities.length > 0;
        const dayMins = { spiritual: 0, skills: 0, health: 0 };

        if (hasEntry) {
            weekAgg.diaryDays++;
            const dayAgg = aggregateActivities(entry.activities);
            weekAgg.prayerMins           += dayAgg.prayerMins;
            weekAgg.bibleStudyMins       += dayAgg.bibleStudyMins;
            weekAgg.exerciseMins         += dayAgg.exerciseMins;
            weekAgg.codingSessions       += dayAgg.codingSessions;
            weekAgg.fastingDays          += dayAgg.fastingDays;
            weekAgg.baseTrainingSessions += dayAgg.baseTrainingSessions;
            ['spiritual','skills','health'].forEach(c => {
                weekAgg.catMins[c] += dayAgg.catMins[c];
                dayMins[c]          = dayAgg.catMins[c];
            });
            weekAgg.totalMins += dayAgg.totalMins;

            // Water from food
            if (entry.food && entry.food.water) weekAgg.waterMl += parseWaterMl(entry.food.water);

            // Finances
            if (entry.finances) {
                weekSpent += (entry.finances.expenses || []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
                if (entry.finances.bankBalance !== '') latestBalance = entry.finances.bankBalance;
            }
        }
        const dayTotal = dayMins.spiritual + dayMins.skills + dayMins.health;
        gridHtml += `
            <div class="week-day ${isToday ? 'today' : ''} ${hasEntry ? 'has-entry' : 'no-entry'}">
                <div class="day-label">${dayNames[d.getDay()]}</div>
                <div class="day-date">${d.getDate()}</div>
                <div class="day-dots">
                    ${dayMins.spiritual > 0 ? `<span class="dot dot-spiritual"></span>` : ''}
                    ${dayMins.skills    > 0 ? `<span class="dot dot-skills"></span>`    : ''}
                    ${dayMins.health    > 0 ? `<span class="dot dot-health"></span>`    : ''}
                </div>
                <div class="day-count">${hasEntry ? minsToDisplay(dayTotal) : '—'}</div>
            </div>
        `;
    });
    gridHtml += '</div>';

    if (finCards) finCards.innerHTML = renderFinanceCards(weekSpent, latestBalance);

    const prayerPct   = baselinePct(weekAgg.prayerMins,     BASELINES.prayer * 7);
    const biblePct    = baselinePct(weekAgg.bibleStudyMins, BASELINES.bibleStudy * 7);
    const exercisePct = baselinePct(weekAgg.exerciseMins,   BASELINES.exercise * 7);
    const codingPct   = baselinePct(weekAgg.codingSessions, BASELINES.coding);
    const trainPct    = baselinePct(weekAgg.baseTrainingSessions, BASELINES.baseTraining);
    const diaryPct    = baselinePct(weekAgg.diaryDays,      BASELINES.diaryWeek);

    container.innerHTML = `
        ${renderCategoryCards(weekAgg.catMins, weekAgg.totalMins)}
        <div class="section-title mt-1">📅 7-Day Calendar</div>
        ${gridHtml}
        <div class="section-title mt-1">📊 Weekly Performance vs Baselines</div>
        <div class="baseline-list">
            ${renderBaselineRow('🙏', 'Prayer',        minsToDisplay(weekAgg.prayerMins),     prayerPct,   'var(--color-spiritual)', 'Baseline: 14hrs/week')}
            ${renderBaselineRow('📖', 'Bible Study',   minsToDisplay(weekAgg.bibleStudyMins), biblePct,    'var(--color-spiritual)', 'Baseline: 3.5hrs/week')}
            ${renderBaselineRow('💪', 'Exercise',      minsToDisplay(weekAgg.exerciseMins),   exercisePct, 'var(--color-health)',    'Baseline: 3.5hrs/week')}
            ${renderBaselineRow('💻', 'Coding',        `${weekAgg.codingSessions} sessions`,  codingPct,   'var(--color-skills)',   'Baseline: 3 sessions/week')}
            ${renderBaselineRow('🏋️', 'Base Training', `${weekAgg.baseTrainingSessions} sessions`, trainPct, 'var(--color-health)', 'Baseline: 3 sessions/week')}
            ${renderBaselineRow('📔', 'Diary Updates', `${weekAgg.diaryDays}/7 days`,         diaryPct,    '#059669',               'Baseline: 5 days/week')}
        </div>
        ${weekSpent > 0 ? `
        <div class="section-title mt-1">💰 Weekly Spending</div>
        <div class="finance-summary-box">
            <div class="fin-sum-row"><span>Total Spent This Week</span><span class="fin-sum-val">${formatCurrency(weekSpent)}</span></div>
            <div class="fin-sum-row"><span>Latest Bank Balance</span><span class="fin-sum-val">${latestBalance !== '' ? formatCurrency(latestBalance) : '—'}</span></div>
        </div>` : ''}
        <div class="ai-commentary-box">
            <div class="ai-commentary-header">🤖 AI Weekly Coach</div>
            <div id="weekly-ai-text" class="ai-commentary-loading">Generating weekly review…</div>
        </div>
    `;

    const aiPrompt = `Weekly summary for Pastor Fire:\nPrayer: ${minsToDisplay(weekAgg.prayerMins)} (${prayerPct}% of 14hr baseline)\nBible Study: ${minsToDisplay(weekAgg.bibleStudyMins)} (${biblePct}%)\nExercise: ${minsToDisplay(weekAgg.exerciseMins)} (${exercisePct}%)\nCoding: ${weekAgg.codingSessions} sessions (${codingPct}%)\nDiary logged: ${weekAgg.diaryDays}/7 days (${diaryPct}% — baseline is 5/week)\nSpent: $${weekSpent.toFixed(2)}\n\nWrite a 3-4 sentence warm pastoral weekly coaching note. Comment on prayer vs 14hr target, diary consistency vs 5-day baseline, and spending if relevant. End with motivation for next week.`;

    const commentary = await getAICommentary(aiPrompt);
    const aiEl = document.getElementById('weekly-ai-text');
    if (aiEl) {
        aiEl.className   = 'ai-commentary-text';
        aiEl.textContent = commentary || `🙏 Prayer hit ${prayerPct}% of the 14hr weekly goal. 📔 Diary logged ${weekAgg.diaryDays} of 7 days (target: 5). Keep pushing — every consistent day builds the life you're aiming for!`;
    }
}

// ─── Monthly Review ───────────────────────────────────────────────────────────
async function renderMonthlyReview() {
    const container = document.getElementById('monthly-content');
    const finCards  = document.getElementById('monthly-finance-cards');
    container.innerHTML = '<div class="empty-state"><span>⏳</span><p>Loading…</p></div>';
    if (finCards) finCards.innerHTML = '';

    const entries   = await storage.getMonthEntries();
    const today     = new Date();
    const daysSoFar = today.getDate();
    const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

    const monthAgg = {
        prayerMins: 0, bibleStudyMins: 0, exerciseMins: 0,
        codingSessions: 0, fastingDays: 0, baseTrainingSessions: 0,
        diaryDays: 0, catMins: { spiritual: 0, skills: 0, health: 0 }, totalMins: 0,
    };
    let monthSpent   = 0;
    let latestBalance = '';

    Object.values(entries).forEach(entry => {
        if (!entry.activities || entry.activities.length === 0) return;
        monthAgg.diaryDays++;
        const dayAgg = aggregateActivities(entry.activities);
        monthAgg.prayerMins           += dayAgg.prayerMins;
        monthAgg.bibleStudyMins       += dayAgg.bibleStudyMins;
        monthAgg.exerciseMins         += dayAgg.exerciseMins;
        monthAgg.codingSessions       += dayAgg.codingSessions;
        monthAgg.fastingDays          += dayAgg.fastingDays;
        monthAgg.baseTrainingSessions += dayAgg.baseTrainingSessions;
        ['spiritual','skills','health'].forEach(c => { monthAgg.catMins[c] += dayAgg.catMins[c]; });
        monthAgg.totalMins += dayAgg.totalMins;
        if (entry.finances) {
            monthSpent += (entry.finances.expenses || []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
            if (entry.finances.bankBalance !== '') latestBalance = entry.finances.bankBalance;
        }
    });

    if (finCards) finCards.innerHTML = renderFinanceCards(monthSpent, latestBalance);

    const prayerHrs   = monthAgg.prayerMins / 60;
    const milestone   = prayerHrs >= 60;
    const prayerPct   = baselinePct(monthAgg.prayerMins,     BASELINES.prayer * daysSoFar);
    const biblePct    = baselinePct(monthAgg.bibleStudyMins, BASELINES.bibleStudy * daysSoFar);
    const exercisePct = baselinePct(monthAgg.exerciseMins,   BASELINES.exercise * daysSoFar);
    const fastingPct  = baselinePct(monthAgg.fastingDays,    BASELINES.fasting);
    const diaryPct    = baselinePct(monthAgg.diaryDays,      BASELINES.diaryMonth);
    const weeksElapsed = Math.max(1, Math.ceil(daysSoFar / 7));
    const codingPct   = baselinePct(monthAgg.codingSessions, BASELINES.coding * weeksElapsed);

    container.innerHTML = `
        <div class="month-header"><h3>${monthName}</h3></div>
        ${milestone ? `<div class="milestone-banner">🎉 PRAYER MILESTONE: You've hit 60 hours of prayer this month — celebrate!</div>` : ''}
        ${renderCategoryCards(monthAgg.catMins, monthAgg.totalMins)}
        <div class="section-title mt-1">📈 Monthly Performance vs Baselines</div>
        <div class="baseline-list">
            ${renderBaselineRow('🙏', 'Prayer',        `${prayerHrs.toFixed(1)}hrs`,          prayerPct,   'var(--color-spiritual)', `Baseline: 60hrs/month (2hrs × days)`)}
            ${renderBaselineRow('📖', 'Bible Study',   minsToDisplay(monthAgg.bibleStudyMins), biblePct,   'var(--color-spiritual)', `Baseline: 30mins × ${daysSoFar} days`)}
            ${renderBaselineRow('💪', 'Exercise',      minsToDisplay(monthAgg.exerciseMins),   exercisePct,'var(--color-health)',    `Baseline: 30mins × ${daysSoFar} days`)}
            ${renderBaselineRow('🕊️', 'Fasting',       `${monthAgg.fastingDays} day(s)`,       fastingPct, '#7c3aed',               'Baseline: 3 days/month')}
            ${renderBaselineRow('💻', 'Coding',        `${monthAgg.codingSessions} sessions`,  codingPct,  'var(--color-skills)',   'Baseline: 3 sessions/week')}
            ${renderBaselineRow('📔', 'Diary Consistency', `${monthAgg.diaryDays}/${daysSoFar} days`, diaryPct, '#059669', 'Baseline: 20 logs/month')}
        </div>
        ${monthSpent > 0 ? `
        <div class="section-title mt-1">💰 Monthly Spending</div>
        <div class="finance-summary-box">
            <div class="fin-sum-row"><span>Total Spent This Month</span><span class="fin-sum-val">${formatCurrency(monthSpent)}</span></div>
            <div class="fin-sum-row"><span>Latest Bank Balance</span><span class="fin-sum-val">${latestBalance !== '' ? formatCurrency(latestBalance) : '—'}</span></div>
        </div>` : ''}
        <div class="ai-commentary-box">
            <div class="ai-commentary-header">🤖 AI Monthly Coach</div>
            <div id="monthly-ai-text" class="ai-commentary-loading">Generating monthly review…</div>
        </div>
    `;

    const aiPrompt = `Monthly summary for Pastor Fire — ${monthName}:\nPrayer: ${prayerHrs.toFixed(1)}hrs (${prayerPct}% of 60hr baseline)${milestone ? ' — MILESTONE ACHIEVED!' : ''}\nBible Study: ${minsToDisplay(monthAgg.bibleStudyMins)} (${biblePct}%)\nExercise: ${minsToDisplay(monthAgg.exerciseMins)} (${exercisePct}%)\nFasting: ${monthAgg.fastingDays} days (${fastingPct}% of 3-day baseline)\nCoding: ${monthAgg.codingSessions} sessions (${codingPct}%)\nDiary consistency: ${monthAgg.diaryDays}/${daysSoFar} days (${diaryPct}% — baseline is 20 logs/month)\nTotal spent: $${monthSpent.toFixed(2)}\n\nWrite a 4-5 sentence pastoral monthly review. Celebrate 60hr prayer milestone if hit. Comment on spending habits and diary consistency baseline of 20/month. End powerfully.`;

    const commentary = await getAICommentary(aiPrompt);
    const aiEl = document.getElementById('monthly-ai-text');
    if (aiEl) {
        aiEl.className   = 'ai-commentary-text';
        aiEl.textContent = commentary || `${milestone ? '🎉 Incredible — 60 hours of prayer this month achieved!' : `🙏 Prayer at ${prayerPct}% of the 60hr monthly goal.`} Diary logged ${monthAgg.diaryDays} of ${daysSoFar} days (target: 20/month = ${diaryPct}%). ${monthSpent > 0 ? `Spent $${monthSpent.toFixed(2)} this month.` : ''} Keep building — your discipline today is shaping your destiny!`;
    }
}

// ─── Yearly Review ───────────────────────────────────────────────────────────

async function initYearlyReview() {
    // Populate year selector from available years
    const years   = await storage.getAvailableYears();
    const sel     = document.getElementById('year-selector');
    const curYear = new Date().getFullYear();
    sel.innerHTML = '';
    years.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y; opt.textContent = y;
        if (y === curYear) opt.selected = true;
        sel.appendChild(opt);
    });
    yearlyActiveMonth  = 'all';
    yearlyActiveFilter = 'all';
    renderYearlyReview();
}

async function renderYearlyReview() {
    const container = document.getElementById('yearly-content');
    const finCards  = document.getElementById('yearly-finance-cards');
    container.innerHTML = '<div class="empty-state"><span>⏳</span><p>Loading yearly data…</p></div>';
    if (finCards) finCards.innerHTML = '';

    const year    = parseInt(document.getElementById('year-selector').value) || new Date().getFullYear();
    const entries = await storage.getYearEntries(year);
    yearlyAllEntries = entries;

    renderYearlyContent(entries, year);
}

function filterYearlyMonth(month, btn) {
    yearlyActiveMonth = month;
    document.querySelectorAll('.month-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    renderYearlyContent(yearlyAllEntries, parseInt(document.getElementById('year-selector').value) || new Date().getFullYear());
}

function filterYearlyActivity(filter, btn) {
    yearlyActiveFilter = filter;
    document.querySelectorAll('.act-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    renderYearlyContent(yearlyAllEntries, parseInt(document.getElementById('year-selector').value) || new Date().getFullYear());
}

async function renderYearlyContent(allEntries, year) {
    const container = document.getElementById('yearly-content');
    const finCards  = document.getElementById('yearly-finance-cards');

    // Filter by month if needed
    let entries = allEntries;
    if (yearlyActiveMonth !== 'all') {
        entries = {};
        Object.keys(allEntries).forEach(date => {
            if (new Date(date + 'T00:00:00').getMonth() === yearlyActiveMonth) {
                entries[date] = allEntries[date];
            }
        });
    }

    // ── Aggregate everything ──────────────────────────────────────────────────
    const agg = {
        prayerMins: 0, bibleStudyMins: 0, exerciseMins: 0, fastingDays: 0,
        codingSessions: 0, baseTrainingSessions: 0,
        catMins: { spiritual: 0, skills: 0, health: 0 },
        totalMins: 0, daysLogged: 0, waterMl: 0,
        books: {},        // { title: { pages, audio, count } }
        foodFreq: {},     // { foodName: count }
        monthlyIncome:   new Array(12).fill(0),
        monthlyExpenses: new Array(12).fill(0),
        monthlyPrayer:   new Array(12).fill(0),
        totalIncome: 0, totalExpenses: 0, latestBalance: '',
    };

    Object.keys(entries).forEach(date => {
        const entry = entries[date];
        if (!entry) return;
        const monthIdx = new Date(date + 'T00:00:00').getMonth();
        const hasActs  = entry.activities && entry.activities.length > 0;
        if (hasActs) agg.daysLogged++;

        // Activities
        (entry.activities || []).forEach(a => {
            const name = (a.activity || '').trim().toLowerCase();
            const mins = parseDurationToMins(a.duration);
            const cat  = a.category || 'spiritual';
            if (agg.catMins[cat] !== undefined) agg.catMins[cat] += mins;
            agg.totalMins += mins;

            if (name.includes('prayer') || name.includes('pray')) {
                agg.prayerMins += mins;
                agg.monthlyPrayer[monthIdx] += mins;
            }
            if (name.includes('bible') || name.includes('devotion')) agg.bibleStudyMins += mins;
            if (name.includes('exercise') || name.includes('training') || name.includes('walking') || name.includes('walk') || name.includes('gym') || name.includes('workout')) {
                agg.exerciseMins += mins;
                if (name.includes('base training')) agg.baseTrainingSessions++;
            }
            if (name.includes('coding') || name.includes('code')) agg.codingSessions++;
            if (name.includes('fast') || name.includes('fasting')) agg.fastingDays++;

            // Books
            if ((name.includes('read') || name.includes('book')) && a.bookTitle) {
                const title = a.bookTitle.trim();
                if (title) {
                    if (!agg.books[title]) agg.books[title] = { pages: 0, audio: false, sessions: 0 };
                    agg.books[title].pages    += (a.pagesRead || 0);
                    agg.books[title].audio     = agg.books[title].audio || !!a.isAudio;
                    agg.books[title].sessions += 1;
                }
            }
        });

        // Food frequency
        const food = entry.food || {};
        ['breakfast','lunch','dinner','snacks'].forEach(meal => {
            if (!food[meal]) return;
            // Split by comma for multiple items
            food[meal].split(',').forEach(item => {
                const f = item.trim().toLowerCase();
                if (f) agg.foodFreq[f] = (agg.foodFreq[f] || 0) + 1;
            });
        });

        // Water
        if (food.water) agg.waterMl += parseWaterMl(food.water);

        // Finances
        if (entry.finances) {
            const exp = (entry.finances.expenses || []).reduce((s,e) => s + (parseFloat(e.amount)||0), 0);
            const inc = (entry.finances.income   || []).reduce((s,i) => s + (parseFloat(i.amount)||0), 0);
            agg.monthlyExpenses[monthIdx] += exp;
            agg.monthlyIncome[monthIdx]   += inc;
            agg.totalExpenses += exp;
            agg.totalIncome   += inc;
            if (entry.finances.bankBalance !== '') agg.latestBalance = entry.finances.bankBalance;
        }
    });

    const netPosition = agg.totalIncome - agg.totalExpenses;

    // Finance mini cards
    if (finCards) finCards.innerHTML = `
        <div class="finance-mini-card expense-card"><span class="fmc-icon">💵</span><div><div class="fmc-label">Income</div><div class="fmc-value">${formatCurrency(agg.totalIncome)}</div></div></div>
        <div class="finance-mini-card balance-card"><span class="fmc-icon">💸</span><div><div class="fmc-label">Spent</div><div class="fmc-value">${formatCurrency(agg.totalExpenses)}</div></div></div>
    `;

    const yearLabel = yearlyActiveMonth === 'all' ? year : `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][yearlyActiveMonth]} ${year}`;
    const daysInPeriod = yearlyActiveMonth === 'all' ? 365 : 31;

    // ── Build HTML based on active filter ────────────────────────────────────
    let html = '';

    // Category cards — always shown
    html += renderCategoryCards(agg.catMins, agg.totalMins);

    // ── PRAYER filter ─────────────────────────────────────────────────────────
    if (yearlyActiveFilter === 'all' || yearlyActiveFilter === 'prayer') {
        const prayerHrs = (agg.prayerMins / 60);
        const yearTarget = 730; // 2hrs × 365
        const pct = baselinePct(agg.prayerMins, BASELINES.prayer * daysInPeriod);
        html += `<div class="yearly-section">
            <div class="section-title">🙏 Prayer</div>
            <div class="yearly-big-stat">
                <span class="ybs-number">${prayerHrs.toFixed(1)}</span>
                <span class="ybs-label">hours of prayer${yearlyActiveMonth === 'all' ? ` in ${year}` : ''}</span>
                ${prayerHrs >= 730 ? '<span class="ybs-badge">🏆 730hr Annual Goal Hit!</span>' : ''}
            </div>
            ${renderBaselineRow('🙏', 'Prayer', `${prayerHrs.toFixed(1)}hrs`, pct, 'var(--color-spiritual)', `Yearly target: ${BASELINES.prayer/60 * daysInPeriod}hrs`)}
            <div class="section-title" style="margin-top:1rem;">Month-by-Month Prayer Hours</div>
            ${renderMonthlyBarChart(agg.monthlyPrayer, 'var(--color-spiritual)', 'hrs', 60)}
        </div>`;
    }

    // ── BIBLE STUDY filter ────────────────────────────────────────────────────
    if (yearlyActiveFilter === 'all' || yearlyActiveFilter === 'bibleStudy') {
        const bibleHrs = (agg.bibleStudyMins / 60);
        const pct = baselinePct(agg.bibleStudyMins, BASELINES.bibleStudy * daysInPeriod);
        html += `<div class="yearly-section">
            <div class="section-title">📖 Bible Study</div>
            <div class="yearly-big-stat">
                <span class="ybs-number">${bibleHrs.toFixed(1)}</span>
                <span class="ybs-label">total hours of Bible study</span>
            </div>
            ${renderBaselineRow('📖', 'Bible Study', `${bibleHrs.toFixed(1)}hrs`, pct, 'var(--color-spiritual)', `Target: 30mins/day × ${daysInPeriod} days`)}
        </div>`;
    }

    // ── BOOKS filter ──────────────────────────────────────────────────────────
    if (yearlyActiveFilter === 'all' || yearlyActiveFilter === 'books') {
        const bookList = Object.entries(agg.books).sort((a,b) => b[1].pages - a[1].pages);
        html += `<div class="yearly-section">
            <div class="section-title">📚 Books Read</div>
            <div class="yearly-big-stat">
                <span class="ybs-number">${bookList.length}</span>
                <span class="ybs-label">book${bookList.length !== 1 ? 's' : ''} tracked</span>
            </div>
            ${bookList.length > 0 ? `
            <div class="book-list">
                ${bookList.map(([title, data]) => `
                    <div class="book-item">
                        <div class="book-icon">${data.audio ? '🎧' : '📖'}</div>
                        <div class="book-info">
                            <div class="book-title">${title}</div>
                            <div class="book-meta">${data.audio ? 'Audiobook' : `${data.pages} pages`} · ${data.sessions} session${data.sessions !== 1 ? 's' : ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>` : '<div class="empty-state-small">No books logged yet. Add a book title when logging Reading activities.</div>'}
        </div>`;
    }

    // ── EXERCISE / TRAINING filter ────────────────────────────────────────────
    if (yearlyActiveFilter === 'all' || yearlyActiveFilter === 'exercise') {
        const exHrs = (agg.exerciseMins / 60);
        const pct   = baselinePct(agg.exerciseMins, BASELINES.exercise * daysInPeriod);
        html += `<div class="yearly-section">
            <div class="section-title">💪 Exercise & Training</div>
            <div class="yearly-big-stat">
                <span class="ybs-number">${exHrs.toFixed(1)}</span>
                <span class="ybs-label">total hours of training</span>
            </div>
            ${renderBaselineRow('💪', 'Exercise', `${exHrs.toFixed(1)}hrs`, pct, 'var(--color-health)', `Target: 30mins/day × ${daysInPeriod} days`)}
        </div>`;
    }

    // ── FASTING filter ────────────────────────────────────────────────────────
    if (yearlyActiveFilter === 'all' || yearlyActiveFilter === 'fasting') {
        const yearlyFastTarget = yearlyActiveMonth === 'all' ? 36 : 3;
        const pct = baselinePct(agg.fastingDays, yearlyFastTarget);
        html += `<div class="yearly-section">
            <div class="section-title">🕊️ Fasting</div>
            <div class="yearly-big-stat">
                <span class="ybs-number">${agg.fastingDays}</span>
                <span class="ybs-label">fasting day${agg.fastingDays !== 1 ? 's' : ''} recorded</span>
                ${agg.fastingDays >= 36 ? '<span class="ybs-badge">🏆 Annual fasting goal hit!</span>' : ''}
            </div>
            ${renderBaselineRow('🕊️', 'Fasting', `${agg.fastingDays} days`, pct, '#7c3aed', `Target: 3 days/month (${yearlyFastTarget} for period)`)}
        </div>`;
    }

    // ── FOOD filter ───────────────────────────────────────────────────────────
    if (yearlyActiveFilter === 'all' || yearlyActiveFilter === 'food') {
        const foodSorted = Object.entries(agg.foodFreq).sort((a,b) => b[1] - a[1]).slice(0, 30);
        html += `<div class="yearly-section">
            <div class="section-title">🍽️ Food Patterns</div>
            <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.75rem;">How often each food appeared in your diary. Helps you spot eating patterns.</p>
            ${foodSorted.length > 0 ? `
            <div class="food-freq-grid">
                ${foodSorted.map(([food, count]) => `
                    <div class="food-freq-item">
                        <span class="food-freq-name">${food}</span>
                        <span class="food-freq-count">${count}×</span>
                    </div>
                `).join('')}
            </div>` : '<div class="empty-state-small">No food logged yet. Use the Food & Water section when writing your diary.</div>'}
        </div>`;
    }

    // ── WATER filter ──────────────────────────────────────────────────────────
    if (yearlyActiveFilter === 'all' || yearlyActiveFilter === 'water') {
        const totalLitres = (agg.waterMl / 1000);
        const avgLitres   = agg.daysLogged > 0 ? (totalLitres / agg.daysLogged) : 0;
        const pct         = baselinePct(agg.waterMl, BASELINES.water * daysInPeriod);
        html += `<div class="yearly-section">
            <div class="section-title">💧 Water Intake</div>
            <div class="yearly-stats-row">
                <div class="yearly-mini-stat"><div class="yms-num">${totalLitres.toFixed(1)}L</div><div class="yms-label">Total Water</div></div>
                <div class="yearly-mini-stat"><div class="yms-num">${avgLitres.toFixed(1)}L</div><div class="yms-label">Daily Average</div></div>
                <div class="yearly-mini-stat"><div class="yms-num">${agg.daysLogged}</div><div class="yms-label">Days Logged</div></div>
            </div>
            ${renderBaselineRow('💧', 'Water', `${totalLitres.toFixed(1)}L total`, pct, 'var(--color-health)', 'Baseline: 1.5L/day')}
        </div>`;
    }

    // ── FINANCE filter ────────────────────────────────────────────────────────
    if (yearlyActiveFilter === 'all' || yearlyActiveFilter === 'finance') {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        html += `<div class="yearly-section">
            <div class="section-title">💰 Financial Summary</div>
            <div class="yearly-stats-row">
                <div class="yearly-mini-stat income"><div class="yms-num">${formatCurrency(agg.totalIncome)}</div><div class="yms-label">Total Income</div></div>
                <div class="yearly-mini-stat expense"><div class="yms-num">${formatCurrency(agg.totalExpenses)}</div><div class="yms-label">Total Spent</div></div>
                <div class="yearly-mini-stat ${netPosition >= 0 ? 'income' : 'expense'}"><div class="yms-num">${formatCurrency(Math.abs(netPosition))}</div><div class="yms-label">${netPosition >= 0 ? 'Net Surplus' : 'Net Deficit'}</div></div>
            </div>
            ${agg.latestBalance !== '' ? `<div class="fin-sum-row" style="margin-top:0.5rem;"><span>Latest Bank Balance</span><span class="fin-sum-val">${formatCurrency(agg.latestBalance)}</span></div>` : ''}
            <div class="section-title" style="margin-top:1rem;">Month-by-Month Income vs Expenses</div>
            <div class="monthly-finance-table">
                <div class="mft-header"><span>Month</span><span>Income</span><span>Expenses</span><span>Net</span></div>
                ${months.map((m, i) => {
                    const inc = agg.monthlyIncome[i];
                    const exp = agg.monthlyExpenses[i];
                    const net = inc - exp;
                    if (inc === 0 && exp === 0) return '';
                    return `<div class="mft-row">
                        <span>${m}</span>
                        <span class="fin-income">${inc > 0 ? formatCurrency(inc) : '—'}</span>
                        <span class="fin-expense">${exp > 0 ? formatCurrency(exp) : '—'}</span>
                        <span class="${net >= 0 ? 'fin-income' : 'fin-expense'}">${(inc > 0 || exp > 0) ? formatCurrency(net) : '—'}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }

    // ── Month-by-month heatmap (always shown on 'all' filter) ─────────────────
    if (yearlyActiveFilter === 'all') {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const monthlyDays = new Array(12).fill(0);
        Object.keys(allEntries).forEach(date => {
            const entry = allEntries[date];
            if (entry && entry.activities && entry.activities.length > 0) {
                const m = new Date(date + 'T00:00:00').getMonth();
                monthlyDays[m]++;
            }
        });
        const maxDays = Math.max(...monthlyDays, 1);
        // Days in each month (approx) for generating per-day cells
        const daysInMonth = [31,28,29,31,30,31,30,31,31,30,31,30];
        html += `<div class="yearly-section">
            <div class="yearly-section-title">📅 Activity Heatmap by Month</div>
            <div class="month-heatmap">
                ${months.map((m, i) => {
                    const logged   = monthlyDays[i];
                    const dInM     = daysInMonth[i];
                    const intensity = Math.round((logged / maxDays) * 5);
                    const prayerHrs = (agg.monthlyPrayer[i] / 60).toFixed(1);
                    // Generate one cell per day in the month, filled proportionally
                    const filledCells = Math.round((logged / dInM) * dInM);
                    const cells = Array.from({length: dInM}, (_, d) => {
                        const cellIntensity = d < filledCells ? Math.max(1, intensity) : 0;
                        return `<div class="heatmap-cell heat-${cellIntensity}" title="Day ${d+1}"></div>`;
                    }).join('');
                    return `<div class="heatmap-month">
                        <span class="heatmap-month-label">${m}</span>
                        <div class="heatmap-days">${cells}</div>
                        <span class="heatmap-count">${logged}d · ${prayerHrs}h🙏</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }

    // ── AI Yearly Coach ───────────────────────────────────────────────────────
    html += `<div class="ai-commentary-box">
        <div class="ai-commentary-header">🤖 AI Yearly Coach</div>
        <div id="yearly-ai-text" class="ai-commentary-loading">Generating yearly review…</div>
    </div>`;

    container.innerHTML = html;

    // Load AI commentary
    const prayerHrs = (agg.prayerMins / 60).toFixed(1);
    const bibleHrs  = (agg.bibleStudyMins / 60).toFixed(1);
    const exHrs     = (agg.exerciseMins / 60).toFixed(1);
    const bookCount = Object.keys(agg.books).length;
    const aiPrompt  = `Yearly diary review for Pastor Fire — ${yearLabel}:
Prayer: ${prayerHrs}hrs (annual target 730hrs, ${baselinePct(agg.prayerMins, BASELINES.prayer * 365)}%)
Bible Study: ${bibleHrs}hrs
Exercise: ${exHrs}hrs
Fasting: ${agg.fastingDays} days (target 36/year)
Books read: ${bookCount} book(s) — ${Object.keys(agg.books).join(', ') || 'none logged'}
Water: ${(agg.waterMl/1000).toFixed(1)}L total
Diary logged: ${agg.daysLogged} days
Total Income: $${agg.totalIncome.toFixed(2)}, Total Spent: $${agg.totalExpenses.toFixed(2)}, Net: $${(agg.totalIncome - agg.totalExpenses).toFixed(2)}

Write a 5-6 sentence powerful yearly review. Celebrate prayer milestones. Comment on reading habits vs high-performing leaders. Speak to financial discipline. End with a bold vision statement for the coming year. Tone: pastoral, inspiring, honest.`;

    const commentary = await getAICommentary(aiPrompt);
    const aiEl = document.getElementById('yearly-ai-text');
    if (aiEl) {
        aiEl.className   = 'ai-commentary-text';
        aiEl.textContent = commentary || `🙏 ${prayerHrs} hours of prayer in ${yearLabel} — every hour invested in God's presence is eternal. 📚 ${bookCount} book(s) read — leaders who read lead better. 💰 Income: $${agg.totalIncome.toFixed(2)}, Spent: $${agg.totalExpenses.toFixed(2)}. Let ${year + 1} be the year you exceed every baseline and step fully into your calling!`;
    }
}

// Monthly bar chart helper for yearly view
function renderMonthlyBarChart(monthlyMins, color, unit, divisor) {
    const months  = ['J','F','M','A','M','J','J','A','S','O','N','D'];
    const values  = monthlyMins.map(m => divisor ? (m / divisor) : m);
    const maxVal  = Math.max(...values, 1);
    return `<div class="monthly-bar-chart">
        ${values.map((v, i) => {
            const pct = Math.round((v / maxVal) * 100);
            return `<div class="mbc-col">
                <div class="mbc-bar-wrap">
                    <div class="mbc-bar" style="height:${pct}%;background:${color};" title="${months[i]}: ${v.toFixed(1)}${unit}"></div>
                </div>
                <div class="mbc-label">${months[i]}</div>
            </div>`;
        }).join('')}
    </div>`;
}

// ─── AI Coach Chatbot ─────────────────────────────────────────────────────────
function toggleAICoach() {
    aiCoachOpen = !aiCoachOpen;
    const panel = document.getElementById('ai-coach-panel');
    const fab   = document.getElementById('ai-coach-fab');
    panel.classList.toggle('open', aiCoachOpen);
    fab.classList.toggle('active', aiCoachOpen);

    if (aiCoachOpen) {
        loadChatHistory();
        document.getElementById('ai-coach-input').focus();
        // Greet on first open
        const msgs = storage.getChatHistory();
        if (msgs.length === 0) {
            appendChatMessage('ai', "Hi Pastor Fire! 👋 I'm your AI Coach. I have access to all your diary data — activities, food, finances, prayer hours, and more. Ask me anything!\n\nFor example:\n• \"How was my prayer this week?\"\n• \"How much have I spent this month?\"\n• \"What should I focus on tomorrow?\"");
        }
    }
}

function loadChatHistory() {
    const msgs    = storage.getChatHistory();
    const chatEl  = document.getElementById('ai-coach-messages');
    chatEl.innerHTML = '';
    msgs.forEach(m => appendChatMessage(m.role, m.content, false));
    chatEl.scrollTop = chatEl.scrollHeight;
}

function appendChatMessage(role, content, save = true) {
    const chatEl = document.getElementById('ai-coach-messages');
    const div    = document.createElement('div');
    div.className = `chat-msg chat-${role}`;
    div.textContent = content;
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;

    if (save) {
        const history = storage.getChatHistory();
        history.push({ role, content });
        storage.saveChatHistory(history);
    }
}

function handleChatKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
}

async function sendChatMessage() {
    const input   = document.getElementById('ai-coach-input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    appendChatMessage('user', message);

    // Show typing indicator
    const chatEl     = document.getElementById('ai-coach-messages');
    const typingDiv  = document.createElement('div');
    typingDiv.className = 'chat-msg chat-ai chat-typing';
    typingDiv.textContent = '…';
    chatEl.appendChild(typingDiv);
    chatEl.scrollTop = chatEl.scrollHeight;

    // Build context from recent data
    let context = 'You are AI Coach for Pastor Fire, a pastor in Fiji. You have access to his diary data.\n';
    try {
        const [todayEntry, weekEntries, monthEntries] = await Promise.all([
            storage.getEntry(new Date().toISOString().slice(0, 10)),
            storage.getWeekEntries(),
            storage.getMonthEntries(),
        ]);

        if (todayEntry && todayEntry.activities) {
            const agg = aggregateActivities(todayEntry.activities);
            context += `\nToday's data: Prayer=${minsToDisplay(agg.prayerMins)}, Exercise=${minsToDisplay(agg.exerciseMins)}`;
            if (todayEntry.food) context += `, Food: B="${todayEntry.food.breakfast}" L="${todayEntry.food.lunch}" D="${todayEntry.food.dinner}"`;
            if (todayEntry.finances) {
                const spent = (todayEntry.finances.expenses || []).reduce((s,e) => s + (parseFloat(e.amount)||0), 0);
                context += `, Spent today=$${spent.toFixed(2)}, Balance=$${todayEntry.finances.bankBalance || '?'}`;
            }
        }

        // Week summary
        let weekPrayer = 0, weekSpent = 0, weekDays = 0;
        Object.values(weekEntries).forEach(e => {
            if (!e.activities) return;
            weekDays++;
            const agg = aggregateActivities(e.activities);
            weekPrayer += agg.prayerMins;
            if (e.finances) weekSpent += (e.finances.expenses||[]).reduce((s,ex)=>s+(parseFloat(ex.amount)||0),0);
        });
        context += `\nThis week: Prayer=${minsToDisplay(weekPrayer)} (target 14hrs), Diary logged=${weekDays}/7 days (target 5), Spent=$${weekSpent.toFixed(2)}`;

        // Month summary
        let monthPrayer = 0, monthSpent = 0, monthDays = 0, latestBalance = '';
        Object.values(monthEntries).forEach(e => {
            if (!e.activities) return;
            monthDays++;
            const agg = aggregateActivities(e.activities);
            monthPrayer += agg.prayerMins;
            if (e.finances) {
                monthSpent += (e.finances.expenses||[]).reduce((s,ex)=>s+(parseFloat(ex.amount)||0),0);
                if (e.finances.bankBalance !== '') latestBalance = e.finances.bankBalance;
            }
        });
        context += `\nThis month: Prayer=${(monthPrayer/60).toFixed(1)}hrs (target 60hrs), Diary logged=${monthDays} days (target 20), Total spent=$${monthSpent.toFixed(2)}, Latest balance=$${latestBalance || '?'}`;
    } catch (e) {
        context += '\n(Data unavailable right now)';
    }

    // Chat history for context
    const history = storage.getChatHistory().slice(-10);
    const historyText = history.map(m => `${m.role === 'user' ? 'Pastor Fire' : 'AI Coach'}: ${m.content}`).join('\n');

    const fullPrompt = `${context}\n\nConversation so far:\n${historyText}\n\nPastor Fire: ${message}\n\nAI Coach (respond warmly, concisely, and helpfully — 2-4 sentences max unless detail is needed):`;

    const reply = await getAICommentary(fullPrompt);

    typingDiv.remove();
    appendChatMessage('ai', reply || "I'm having trouble connecting right now. Please check your internet and try again.");
}

// ─── OCR / Photo ──────────────────────────────────────────────────────────────
function setupDropzone() {
    const zone = document.getElementById('dropzone');
    if (!zone) return;
    zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', ()  => zone.classList.remove('dragover'));
    zone.addEventListener('drop',      e => {
        e.preventDefault(); zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) processOcrFile(file);
    });
    zone.addEventListener('click', () => document.getElementById('photo-input').click());
}

function handlePhotoUpload(e) { const f = e.target.files[0]; if (f) processOcrFile(f); }

async function processOcrFile(file) {
    const preview = document.getElementById('photo-preview');
    const reader  = new FileReader();
    reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);
    document.getElementById('ocr-result').style.display   = 'none';
    document.getElementById('ocr-progress').style.display = 'block';
    document.getElementById('import-btn').style.display   = 'none';
    const onStatus   = msg => { const el = document.getElementById('ocr-status'); const bar = document.getElementById('ocr-progress-bar'); if (el) el.textContent = msg; if (bar) bar.style.width = '70%'; };
    const onProgress = p   => { const bar = document.getElementById('ocr-progress-bar'); const el = document.getElementById('ocr-status'); if (bar) bar.style.width = (p.progress*100)+'%'; if (el) el.textContent = p.status||'Processing…'; };
    try {
        const result = await ocr.processImage(file, { onStatus, onProgress });
        document.getElementById('ocr-progress-bar').style.width = '100%';
        extractedOcrData = result;
        displayOcrResult(result);
    } catch (e) {
        showToast('OCR failed: ' + e.message, 'error');
        document.getElementById('ocr-progress').style.display = 'none';
    }
}

function displayOcrResult(result) {
    document.getElementById('ocr-progress').style.display = 'none';
    document.getElementById('ocr-result').style.display   = 'block';
    document.getElementById('import-btn').style.display   = 'inline-block';
    document.getElementById('ocr-date').textContent       = result.date;
    const list = document.getElementById('ocr-activities-list');
    list.innerHTML = result.activities.length === 0
        ? '<li class="empty-state-small">No activities detected.</li>'
        : result.activities.map(a => `<li class="ocr-activity-item cat-${a.category}"><span>${a.time||'—'}</span><span>${a.activity}</span><span>${a.duration||''}</span><span class="act-cat-badge cat-badge-${a.category}">${a.category}</span></li>`).join('');
}

function importOcrData() {
    if (!extractedOcrData) return;
    showTab('write');
    document.getElementById('entry-date').value = extractedOcrData.date;
    document.getElementById('activities-container').innerHTML = '';
    activityCount = 0;
    extractedOcrData.activities.forEach(a => addActivityField(a));
    showToast('OCR data imported! Review and save.', 'success');
}

// ─── Export / Import ──────────────────────────────────────────────────────────
function toggleDropdown(id) {
    const menu = document.getElementById(id);
    document.querySelectorAll('.dropdown-menu').forEach(m => { if (m.id !== id) m.classList.remove('open'); });
    menu.classList.toggle('open');
}
document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown'))
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
});

async function exportAsPDF() {
    document.getElementById('export-dropdown').classList.remove('open');
    showToast('Building PDF…', 'info');
    try {
        const { jsPDF } = window.jspdf;
        const doc     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const entries = await storage.getAllEntries();
        const dates   = Object.keys(entries).sort().reverse();
        let y = 20;
        doc.setFontSize(18); doc.text('📔 Diary Tracker Report', 20, y); y += 12;
        doc.setFontSize(10); doc.setTextColor(100); doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, y); y += 10;
        dates.forEach(date => {
            const entry = entries[date];
            if (!entry.activities || entry.activities.length === 0) return;
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setFontSize(13); doc.setTextColor(15,52,96); doc.text(date, 20, y); y += 8;
            entry.activities.forEach(a => {
                if (y > 270) { doc.addPage(); y = 20; }
                doc.setFontSize(9); doc.setTextColor(40);
                doc.text(`  ${a.time||'--'} | ${a.activity} | ${a.duration||''}`, 25, y); y += 5;
            });
            y += 4;
        });
        doc.save('diary-report.pdf');
        showToast('PDF exported ✅', 'success');
    } catch (e) { console.error(e); showToast('PDF export failed', 'error'); }
}

async function exportAsImage(format) {
    document.getElementById('export-dropdown').classList.remove('open');
    showToast('Capturing image…', 'info');
    try {
        const el     = document.querySelector('.tab-content.active');
        const canvas = await html2canvas(el, { scale: 2 });
        const link   = document.createElement('a');
        link.href     = canvas.toDataURL(`image/${format}`);
        link.download = `diary-export.${format}`;
        link.click();
        showToast(`${format.toUpperCase()} exported ✅`, 'success');
    } catch (e) { showToast('Image export failed', 'error'); }
}

function importAs(type) {
    document.getElementById('import-dropdown').classList.remove('open');
    if (type === 'pdf')   document.getElementById('import-pdf-file').click();
    if (type === 'image') document.getElementById('import-image-file').click();
}

async function handlePdfImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    showToast('Reading PDF…', 'info');
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf  = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page    = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
        }
        extractedOcrData = ocr.parseText(text);
        showTab('photo');
        displayOcrResult(extractedOcrData);
        showToast('PDF parsed ✅', 'success');
    } catch (e) { showToast('PDF import failed: ' + e.message, 'error'); }
}

function handleImageImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    showTab('photo');
    processOcrFile(file);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className   = `toast toast-${type} show`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 4000);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    storage.init();
    loadDailyScripture();
    setupDropzone();
    document.getElementById('entry-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('entry-date').addEventListener('change', loadEntryForDate);
    addActivityField();
    addExpenseRow();
    // Show write tab by default
    showTab('write');
});
