// app.js - Main application logic (Supabase-powered)

let activityCount    = 0;
let currentTab       = 'daily';
let extractedOcrData = null;

// ─── Baselines (hardcoded — adjustable later) ─────────────────────────────────
// All time baselines in MINUTES per day unless otherwise noted.
const BASELINES = {
    prayer:        120,   // 2hrs/day
    bibleStudy:    30,    // 30mins/day
    bookPages:     20,    // 20 pages/day (reasonable daily reading goal)
    water:         1500,  // 1.5L/day (stored in ml for math)
    exercise:      30,    // 30mins/day
    coding:        3,     // 3 sessions/week  → assessed weekly
    fasting:       3,     // 3 days/month     → assessed monthly
    baseTraining:  3,     // 3 sessions/week  → assessed weekly
    diaryUpdate:   1,     // 1 update/day     → consistency check
};

// Activity name → baseline key mapping (case-insensitive matching)
const ACTIVITY_BASELINE_MAP = {
    'prayer':         'prayer',
    'bible study':    'bibleStudy',
    'bible':          'bibleStudy',
    'reading':        'bookPages',
    'book':           'bookPages',
    'books':          'bookPages',
    'water':          'water',
    'exercise':       'exercise',
    'training':       'exercise',
    'gym':            'exercise',
    'walking':        'exercise',
    'run':            'exercise',
    'running':        'exercise',
    'base training':  'baseTraining',
    'coding':         'coding',
    'code':           'coding',
    'fasting':        'fasting',
    'fast':           'fasting',
};

// ─── Duration Parser ──────────────────────────────────────────────────────────
function parseDurationToMins(str) {
    if (!str || typeof str !== 'string') return 0;
    const s = str.trim().toLowerCase();
    let mins = 0;
    const hrMatch  = s.match(/(\d+)\s*hrs?/);
    if (hrMatch)  mins += parseInt(hrMatch[1],  10) * 60;
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

// ─── Baseline Helpers ─────────────────────────────────────────────────────────
function getBaselineKey(activityName) {
    if (!activityName) return null;
    const lower = activityName.trim().toLowerCase();
    return ACTIVITY_BASELINE_MAP[lower] || null;
}

// Calculate percentage vs baseline, capped at 100% for display bars
function baselinePct(actual, baseline) {
    if (!baseline || baseline === 0) return 0;
    return Math.min(Math.round((actual / baseline) * 100), 200); // allow showing over 100%
}

// ─── Daily Scripture (NKJV) ──────────────────────────────────────────────────
const SCRIPTURES = [
    { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13 (NKJV)" },
    { text: "For with God nothing will be impossible.", ref: "Luke 1:37 (NKJV)" },
    { text: "But those who wait on the LORD shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.", ref: "Isaiah 40:31 (NKJV)" },
    { text: "But Jesus looked at them and said to them, 'With men this is impossible, but with God all things are possible.'", ref: "Matthew 19:26 (NKJV)" },
    { text: "Now to Him who is able to do exceedingly abundantly above all that we ask or think, according to the power that works in us.", ref: "Ephesians 3:20 (NKJV)" },
    { text: "Commit your works to the LORD, and your thoughts will be established.", ref: "Proverbs 16:3 (NKJV)" },
    { text: "For I know the thoughts that I think toward you, says the LORD, thoughts of peace and not of evil, to give you a future and a hope.", ref: "Jeremiah 29:11 (NKJV)" },
    { text: "Ask, and it will be given to you; seek, and you will find; knock, and it will be opened to you.", ref: "Matthew 7:7 (NKJV)" },
    { text: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.", ref: "2 Timothy 1:7 (NKJV)" },
    { text: "You will also declare a thing, and it will be established for you; so light will shine on your ways.", ref: "Job 22:28 (NKJV)" },
    { text: "And my God shall supply all your need according to His riches in glory by Christ Jesus.", ref: "Philippians 4:19 (NKJV)" },
    { text: "Eye has not seen, nor ear heard, nor have entered into the heart of man the things which God has prepared for those who love Him.", ref: "1 Corinthians 2:9 (NKJV)" },
    { text: "Be strong and of good courage; do not be afraid, nor be dismayed, for the LORD your God is with you wherever you go.", ref: "Joshua 1:9 (NKJV)" },
    { text: "He gives wisdom to the wise and knowledge to those who have understanding. He reveals deep and secret things.", ref: "Daniel 2:21–22 (NKJV)" },
    { text: "Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers.", ref: "3 John 1:2 (NKJV)" },
    { text: "And the LORD will make you the head and not the tail; you shall be above only, and not be beneath.", ref: "Deuteronomy 28:13 (NKJV)" },
    { text: "Trust in the LORD with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths.", ref: "Proverbs 3:5–6 (NKJV)" },
    { text: "The LORD your God will bless you in all your produce and in all the work of your hands, so that you surely rejoice.", ref: "Deuteronomy 16:15 (NKJV)" },
    { text: "And whatever you do, do it heartily, as to the Lord and not to men.", ref: "Colossians 3:23 (NKJV)" },
    { text: "Without counsel, plans go awry, but in the multitude of counselors they are established.", ref: "Proverbs 15:22 (NKJV)" },
    { text: "The effective, fervent prayer of a righteous man avails much.", ref: "James 5:16 (NKJV)" },
    { text: "But seek first the kingdom of God and His righteousness, and all these things shall be added to you.", ref: "Matthew 6:33 (NKJV)" },
    { text: "Delight yourself also in the LORD, and He shall give you the desires of your heart.", ref: "Psalm 37:4 (NKJV)" },
    { text: "The LORD is my shepherd; I shall not want.", ref: "Psalm 23:1 (NKJV)" },
    { text: "Now faith is the substance of things hoped for, the evidence of things not seen.", ref: "Hebrews 11:1 (NKJV)" },
    { text: "What then shall we say to these things? If God is for us, who can be against us?", ref: "Romans 8:31 (NKJV)" },
    { text: "The plans of the diligent lead surely to plenty, but those of everyone who is hasty, surely to poverty.", ref: "Proverbs 21:5 (NKJV)" },
    { text: "Let your light so shine before men, that they may see your good works and glorify your Father in heaven.", ref: "Matthew 5:16 (NKJV)" },
    { text: "For we are His workmanship, created in Christ Jesus for good works, which God prepared beforehand that we should walk in them.", ref: "Ephesians 2:10 (NKJV)" },
    { text: "Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God.", ref: "Philippians 4:6 (NKJV)" },
    { text: "And we know that all things work together for good to those who love God, to those who are the called according to His purpose.", ref: "Romans 8:28 (NKJV)" },
    { text: "The LORD is my light and my salvation; whom shall I fear? The LORD is the strength of my life; of whom shall I be afraid?", ref: "Psalm 27:1 (NKJV)" },
];

function loadDailyScripture() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const s = SCRIPTURES[dayOfYear % SCRIPTURES.length];
    const textEl = document.getElementById('scripture-text');
    const refEl  = document.getElementById('scripture-ref');
    if (textEl) textEl.textContent = '\u201c' + s.text + '\u201d';
    if (refEl)  refEl.textContent  = '\u2014 ' + s.ref;
}

// ─── Tab Navigation ──────────────────────────────────────────────────────────
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
}

// ─── Activity Presets Dropdown ────────────────────────────────────────────────
function buildPresetOptions() {
    const presets = storage.getPresets();
    return presets.map(p =>
        `<div class="preset-option cat-${p.category}" onclick="selectPreset(this, '${p.name.replace(/'/g,"\\'")}', '${p.category}')">${p.name}</div>`
    ).join('');
}

function selectPreset(el, name, category) {
    const dropdown = el.closest('.preset-dropdown');
    const row      = dropdown.closest('.activity-row');
    if (!row) return;
    const textInput = row.querySelector('.act-text');
    const catSelect = row.querySelector('.act-category');
    textInput.value = name;
    catSelect.value = category;
    const id = row.id.replace('activity-', '');
    updateCategoryColor(id, category);
    dropdown.classList.remove('open');
}

function togglePresetDropdown(btn) {
    const row      = btn.closest('.activity-row');
    const dropdown = row.querySelector('.preset-dropdown');
    dropdown.querySelector('.preset-list').innerHTML = buildPresetOptions();
    document.querySelectorAll('.preset-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
    });
    dropdown.classList.toggle('open');
}

document.addEventListener('click', e => {
    if (!e.target.closest('.preset-toggle-btn') && !e.target.closest('.preset-dropdown')) {
        document.querySelectorAll('.preset-dropdown').forEach(d => d.classList.remove('open'));
    }
});

// ─── Activity Fields ─────────────────────────────────────────────────────────
function addActivityField(prefill = {}) {
    activityCount++;
    const id = activityCount;
    const container = document.getElementById('activities-container');
    const div = document.createElement('div');
    div.className = 'activity-row';
    div.id = 'activity-' + id;
    div.innerHTML = `
        <input type="time" class="act-time" value="${prefill.time || ''}" placeholder="Time">
        <div class="act-text-wrap">
            <input type="text" class="act-text" value="${prefill.activity || ''}" placeholder="Activity..." oninput="autoCategorize(${id})">
            <button class="preset-toggle-btn" onclick="togglePresetDropdown(this)" title="Pick saved activity">▾</button>
            <div class="preset-dropdown">
                <div class="preset-list">${buildPresetOptions()}</div>
                <div class="preset-add-row">
                    <input class="preset-add-input" type="text" placeholder="Add new activity name...">
                    <button onclick="addNewPresetFromRow(this)">+ Save</button>
                </div>
            </div>
        </div>
        <input type="text" class="act-duration" value="${prefill.duration || ''}" placeholder="e.g. 1hr 30mins">
        <select class="act-category" onchange="updateCategoryColor(${id}, this.value)">
            <option value="general"  ${prefill.category === 'general'  ? 'selected' : ''}>General</option>
            <option value="spiritual"${prefill.category === 'spiritual' ? 'selected' : ''}>🟠 Spiritual</option>
            <option value="skills"   ${prefill.category === 'skills'    ? 'selected' : ''}>🟢 Skills</option>
            <option value="health"   ${prefill.category === 'health'    ? 'selected' : ''}>🔵 Health</option>
        </select>
        <button class="btn-remove" onclick="removeActivity(${id})">✕</button>
    `;
    container.appendChild(div);
    updateCategoryColor(id, prefill.category || 'general');
}

function addNewPresetFromRow(btn) {
    const row   = btn.closest('.preset-dropdown');
    const input = row.querySelector('.preset-add-input');
    const name  = input.value.trim();
    if (!name) return;
    const actRow = btn.closest('.activity-row');
    const cat    = actRow ? actRow.querySelector('.act-category').value : 'general';
    const added  = storage.addPreset(name, cat);
    if (added) {
        showToast(`"${name}" saved to presets ✅`, 'success');
        input.value = '';
        row.querySelector('.preset-list').innerHTML = buildPresetOptions();
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
            el.querySelector('.act-category').value = 'general';
            updateCategoryColor(id, 'general');
        }
        return;
    }
    const el = document.getElementById('activity-' + id);
    if (el) el.remove();
}

function autoCategorize(id) {
    const row = document.getElementById('activity-' + id);
    if (!row) return;
    const text    = row.querySelector('.act-text').value;
    const presets = storage.getPresets();
    const match   = presets.find(p => p.name.toLowerCase() === text.trim().toLowerCase());
    const cat     = match ? match.category : ocr.categorizeActivity(text);
    row.querySelector('.act-category').value = cat;
    updateCategoryColor(id, cat);
}

function updateCategoryColor(id, category) {
    const row = document.getElementById('activity-' + id);
    if (!row) return;
    row.className = 'activity-row cat-' + category;
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
        activities.push({
            time:     row.querySelector('.act-time').value,
            activity: text,
            duration: row.querySelector('.act-duration').value.trim(),
            category: row.querySelector('.act-category').value
        });
    });

    if (activities.length === 0) { showToast('Add at least one activity', 'error'); return; }

    showToast('Saving…', 'info');
    const entry = { date, activities, review: document.getElementById('daily-review').value };
    const saved = await storage.saveEntry(date, entry);
    if (saved) {
        showToast('Activities saved ✅', 'success');
        resetForm();
    } else {
        showToast('Save failed — check console', 'error');
    }
}

function resetForm() {
    document.getElementById('activities-container').innerHTML = '';
    document.getElementById('daily-review').value = '';
    activityCount = 0;
    addActivityField();
    document.getElementById('entry-date').value = new Date().toISOString().slice(0, 10);
    window._editingFullList = null;
}

async function loadEntryForDate() {
    const date = document.getElementById('entry-date').value;
    if (!date) return;

    document.getElementById('activities-container').innerHTML = '';
    document.getElementById('daily-review').value = '';
    activityCount = 0;
    addActivityField();

    const entry = await storage.getEntry(date);
    if (entry && entry.activities && entry.activities.length > 0) {
        const totalMins = entry.activities.reduce((s, a) => s + parseDurationToMins(a.duration), 0);
        const summary   = minsToDisplay(totalMins);
        showToast(`${entry.activities.length} activities already saved for ${date} (${summary} total). New activities will be added to them.`, 'info');
        let banner = document.getElementById('existing-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'existing-banner';
            banner.className = 'existing-banner';
            document.getElementById('activities-container').before(banner);
        }
        banner.innerHTML = `
            <span>📋 ${entry.activities.length} activities already logged for this date (${summary} total). New rows below will be <strong>added</strong> to them.</span>
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
    if (!entry || !entry.activities) return;
    document.getElementById('activities-container').innerHTML = '';
    activityCount = 0;
    entry.activities.forEach(a => addActivityField(a));
    addActivityField();
    document.getElementById('daily-review').value = entry.review || '';
    showToast('Loaded all activities for editing. Saving will replace the full list for this date.', 'info');
    window._editingFullList = date;
    const banner = document.getElementById('existing-banner');
    if (banner) banner.innerHTML = `<span>✏️ Editing full list for ${date}. Saving will <strong>replace</strong> the entire day's activities.</span>`;
}

// ─── Aggregate activities into tracked metrics ────────────────────────────────
// Returns an object with totals for each tracked activity type
function aggregateActivities(activities) {
    const result = {
        prayerMins:      0,
        bibleStudyMins:  0,
        bookPages:       0,   // stored in notes as "X pages" or number field
        waterMl:         0,   // stored as "Xml" or "Xl" in duration
        exerciseMins:    0,
        codingSessions:  0,
        fastingDays:     0,   // count of full fasting activities
        baseTrainingSessions: 0,
        diaryUpdated:    true, // if this function is called, diary was updated
        foodItems:       [],   // list of food descriptions
        otherActivities: [],   // anything not in a known baseline
        catMins:         { spiritual: 0, skills: 0, health: 0, general: 0 },
        totalMins:       0,
    };

    (activities || []).forEach(a => {
        const name  = (a.activity || '').trim().toLowerCase();
        const mins  = parseDurationToMins(a.duration);
        const cat   = a.category || 'general';

        // accumulate category minutes
        if (result.catMins[cat] !== undefined) result.catMins[cat] += mins;
        result.totalMins += mins;

        // Prayer
        if (name.includes('prayer') || name.includes('pray')) {
            result.prayerMins += mins;
        }
        // Bible Study
        else if (name.includes('bible') || name.includes('devotion') || name.includes('bible study')) {
            result.bibleStudyMins += mins;
        }
        // Reading / Books — look for page count in duration field e.g. "20 pages" or "20p"
        else if (name.includes('reading') || name.includes('book')) {
            const pageMatch = (a.duration || '').match(/(\d+)\s*(?:pages?|p\b)/i);
            if (pageMatch) result.bookPages += parseInt(pageMatch[1], 10);
            else result.bookPages += 0; // duration was time-based
        }
        // Water — look for ml/L in duration e.g. "1.5L" "500ml"
        else if (name.includes('water')) {
            const litreMatch = (a.duration || '').match(/([\d.]+)\s*l(?:itres?|iters?)?/i);
            const mlMatch    = (a.duration || '').match(/([\d.]+)\s*ml/i);
            if (litreMatch) result.waterMl += parseFloat(litreMatch[1]) * 1000;
            else if (mlMatch) result.waterMl += parseFloat(mlMatch[1]);
        }
        // Food — record description
        else if (name.includes('food') || name.includes('meal') || name.includes('eat') || name.includes('breakfast') || name.includes('lunch') || name.includes('dinner')) {
            result.foodItems.push(a.activity);
        }
        // Exercise / Training
        else if (name.includes('exercise') || name.includes('walking') || name.includes('walk') || name.includes('run') || name.includes('gym') || name.includes('training') || name.includes('workout')) {
            result.exerciseMins += mins;
        }
        // Base Training (separate from general exercise)
        else if (name.includes('base training')) {
            result.baseTrainingSessions += 1;
            result.exerciseMins += mins;
        }
        // Coding
        else if (name.includes('coding') || name.includes('code') || name.includes('programming')) {
            result.codingSessions += 1;
        }
        // Fasting
        else if (name.includes('fast') || name.includes('fasting')) {
            result.fastingDays += 1;
        }
        // Other
        else {
            result.otherActivities.push(a);
        }
    });

    return result;
}

// ─── Render a baseline progress row ──────────────────────────────────────────
function renderBaselineRow(icon, label, actualDisplay, pct, color, subLabel) {
    const barPct = Math.min(pct, 100);
    const pctLabel = pct > 100
        ? `<span class="baseline-over">🎉 ${pct}%</span>`
        : `<span class="baseline-pct ${pct >= 80 ? 'pct-good' : pct >= 50 ? 'pct-mid' : 'pct-low'}">${pct}%</span>`;
    return `
        <div class="baseline-row">
            <div class="baseline-header">
                <span class="baseline-icon">${icon}</span>
                <span class="baseline-label">${label}</span>
                <span class="baseline-actual">${actualDisplay}</span>
                ${pctLabel}
            </div>
            ${subLabel ? `<div class="baseline-sublabel">${subLabel}</div>` : ''}
            <div class="baseline-track">
                <div class="baseline-fill" style="width:${barPct}%; background:${color};"></div>
            </div>
        </div>
    `;
}

// ─── Gemini AI Commentary ─────────────────────────────────────────────────────
async function getAICommentary(prompt) {
    try {
        const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'commentary', prompt })
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.commentary || null;
    } catch (e) {
        console.warn('AI commentary unavailable:', e);
        return null;
    }
}

// ─── Category Summary Cards ───────────────────────────────────────────────────
function renderCategoryCards(catMins, totalMins) {
    const cats = [
        { key: 'spiritual', label: 'Spiritual', icon: '🟠', color: 'var(--color-spiritual)' },
        { key: 'skills',    label: 'Skills',    icon: '🟢', color: 'var(--color-skills)'    },
        { key: 'health',    label: 'Health',    icon: '🔵', color: 'var(--color-health)'    },
        { key: 'general',   label: 'General',   icon: '⚪', color: 'var(--color-general)'   },
    ];
    return `<div class="category-cards">${cats.map(c => {
        const pct = totalMins > 0 ? Math.round((catMins[c.key] / totalMins) * 100) : 0;
        return `
            <div class="cat-summary-card" style="border-top: 4px solid ${c.color}">
                <div class="cat-card-icon">${c.icon}</div>
                <div class="cat-card-label">${c.label}</div>
                <div class="cat-card-pct" style="color:${c.color}">${pct}%</div>
                <div class="cat-card-time">${minsToDisplay(catMins[c.key])}</div>
            </div>
        `;
    }).join('')}</div>`;
}

// ─── Daily Summary ────────────────────────────────────────────────────────────
async function renderDailySummary() {
    const today     = new Date().toISOString().slice(0, 10);
    const container = document.getElementById('daily-summary-content');
    container.innerHTML = '<div class="empty-state"><span>⏳</span><p>Loading from Supabase…</p></div>';

    const entry = await storage.getEntry(today);

    if (!entry || !entry.activities || entry.activities.length === 0) {
        container.innerHTML = '<div class="empty-state"><span>📭</span><p>No entry for today yet. Write your first diary entry!</p></div>';
        return;
    }

    const agg = aggregateActivities(entry.activities);

    // Prayer % vs 2hr baseline
    const prayerPct    = baselinePct(agg.prayerMins,     BASELINES.prayer);
    const biblePct     = baselinePct(agg.bibleStudyMins, BASELINES.bibleStudy);
    const exercisePct  = baselinePct(agg.exerciseMins,   BASELINES.exercise);
    const waterPct     = baselinePct(agg.waterMl,        BASELINES.water);
    const bookPct      = agg.bookPages > 0 ? baselinePct(agg.bookPages, BASELINES.bookPages) : null;
    const diaryPct     = 100; // logged today = 100%

    // Build AI commentary prompt
    const aiPromptLines = [
        `Today's diary log for Pastor Fire (${today}):`,
        `- Prayer: ${minsToDisplay(agg.prayerMins)} (${prayerPct}% of 2hr baseline)`,
        `- Bible Study: ${minsToDisplay(agg.bibleStudyMins)} (${biblePct}% of 30min baseline)`,
        agg.bookPages > 0 ? `- Reading: ${agg.bookPages} pages (${bookPct}% of ${BASELINES.bookPages} pages baseline)` : '',
        agg.foodItems.length > 0 ? `- Food logged: ${agg.foodItems.join(', ')}` : '',
        agg.waterMl > 0 ? `- Water: ${(agg.waterMl/1000).toFixed(1)}L (${waterPct}% of 1.5L baseline)` : '',
        `- Exercise: ${minsToDisplay(agg.exerciseMins)} (${exercisePct}% of 30min baseline)`,
        `- Diary updated: Yes`,
        agg.otherActivities.length > 0 ? `- Other: ${agg.otherActivities.map(o => o.activity).join(', ')}` : '',
        `\nPlease give a short (3-4 sentences), warm, encouraging daily commentary. ` +
        `Mention any standout achievements and gently note anything that fell short of the baseline. ` +
        `For food, comment on whether it sounds balanced. ` +
        `End with a motivating sentence for tomorrow.`
    ].filter(Boolean).join('\n');

    // Show UI first, then load commentary
    container.innerHTML = `
        ${renderCategoryCards(agg.catMins, agg.totalMins)}
        <div class="section-title">📊 Today's Activity Performance</div>
        <div class="baseline-list">
            ${renderBaselineRow('🙏', 'Prayer', minsToDisplay(agg.prayerMins), prayerPct, 'var(--color-spiritual)', `Baseline: 2hrs/day`)}
            ${renderBaselineRow('📖', 'Bible Study', minsToDisplay(agg.bibleStudyMins), biblePct, 'var(--color-spiritual)', `Baseline: 30mins/day`)}
            ${agg.bookPages > 0 ? renderBaselineRow('📚', 'Reading', `${agg.bookPages} pages`, bookPct, 'var(--color-skills)', `Baseline: ${BASELINES.bookPages} pages/day`) : ''}
            ${agg.waterMl > 0 ? renderBaselineRow('💧', 'Water', `${(agg.waterMl/1000).toFixed(1)}L`, waterPct, 'var(--color-health)', `Baseline: 1.5L/day`) : ''}
            ${renderBaselineRow('💪', 'Exercise', minsToDisplay(agg.exerciseMins), exercisePct, 'var(--color-health)', `Baseline: 30mins/day`)}
            ${renderBaselineRow('📔', 'Diary Update', 'Logged ✓', 100, '#059669', 'Baseline: daily')}
            ${agg.codingSessions > 0 ? renderBaselineRow('💻', 'Coding', `${agg.codingSessions} session${agg.codingSessions > 1 ? 's' : ''}`, Math.round((agg.codingSessions/3)*100*7), 'var(--color-skills)', 'Baseline: 3 sessions/week') : ''}
            ${agg.fastingDays > 0 ? renderBaselineRow('🕊️', 'Fasting', `${agg.fastingDays} day${agg.fastingDays > 1 ? 's' : ''}`, Math.round((agg.fastingDays/3)*100), '#7c3aed', 'Monthly baseline: 3 days') : ''}
        </div>
        ${agg.foodItems.length > 0 ? `
        <div class="section-title">🍽️ Food Today</div>
        <div class="food-list">${agg.foodItems.map(f => `<span class="food-tag">${f}</span>`).join('')}</div>
        ` : ''}
        <div class="section-title">📋 All Activities</div>
        <div class="activities-list">
            ${entry.activities.map(a => `
                <div class="activity-item cat-${a.category}">
                    <span class="act-time-badge">${a.time || '—'}</span>
                    <span class="act-name">${a.activity}</span>
                    <span class="act-dur">${a.duration || ''}</span>
                    <span class="act-cat-badge cat-badge-${a.category}">${a.category}</span>
                </div>
            `).join('')}
        </div>
        ${entry.review ? `<div class="review-box"><strong>Reflection:</strong> ${entry.review}</div>` : ''}
        <div class="ai-commentary-box" id="daily-ai-box">
            <div class="ai-commentary-header">🤖 AI Daily Coach</div>
            <div id="daily-ai-text" class="ai-commentary-loading">Generating commentary…</div>
        </div>
    `;

    // Load AI commentary async
    const commentary = await getAICommentary(aiPromptLines);
    const aiEl = document.getElementById('daily-ai-text');
    if (aiEl) {
        aiEl.className = 'ai-commentary-text';
        aiEl.textContent = commentary || generateFallbackDailyCommentary(agg, prayerPct, biblePct, exercisePct);
    }
}

function generateFallbackDailyCommentary(agg, prayerPct, biblePct, exercisePct) {
    const lines = [];
    if (prayerPct >= 100) lines.push('🙏 Outstanding — you hit your full 2-hour prayer goal today!');
    else if (prayerPct >= 50) lines.push(`🙏 Good prayer time today (${prayerPct}% of your 2hr goal). Keep building that consistency.`);
    else lines.push(`🙏 Prayer was below your 2hr baseline today (${prayerPct}%). Even short prayer sessions count — try to make up the difference tomorrow.`);

    if (biblePct >= 100) lines.push('📖 Full Bible study baseline met — well done!');
    else if (biblePct > 0) lines.push(`📖 Bible study was ${biblePct}% of your 30-min baseline. A little more each day adds up greatly.`);
    else lines.push('📖 No Bible study logged today. Even 10 minutes of reading God\'s Word makes a difference.');

    if (exercisePct >= 100) lines.push('💪 Exercise goal crushed — your body and mind will thank you!');
    else if (exercisePct > 0) lines.push(`💪 Got some movement in (${exercisePct}% of baseline) — great start!`);

    if (agg.foodItems.length > 0) lines.push(`🍽️ Food logged: ${agg.foodItems.join(', ')}. Aim for balanced meals with vegetables, protein and complex carbs.`);

    lines.push('Keep going — consistency is what builds character. Tomorrow is a fresh opportunity!');
    return lines.join(' ');
}

// ─── Weekly View ──────────────────────────────────────────────────────────────
async function renderWeeklyView() {
    const container = document.getElementById('weekly-content');
    container.innerHTML = '<div class="empty-state"><span>⏳</span><p>Loading from Supabase…</p></div>';

    const entries = await storage.getWeekEntries();
    const days    = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }

    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    // Weekly aggregates
    const weekAgg = {
        prayerMins:      0,
        bibleStudyMins:  0,
        bookPages:       0,
        waterMl:         0,
        exerciseMins:    0,
        codingSessions:  0,
        fastingDays:     0,
        baseTrainingSessions: 0,
        diaryDays:       0,
        catMins:         { spiritual: 0, skills: 0, health: 0, general: 0 },
        totalMins:       0,
    };

    let   gridHtml   = '<div class="week-grid">';
    const daysLogged = [];

    days.forEach(day => {
        const entry    = entries[day];
        const d        = new Date(day + 'T00:00:00');
        const isToday  = day === new Date().toISOString().slice(0, 10);
        const hasEntry = entry && entry.activities && entry.activities.length > 0;
        const dayMins  = { spiritual: 0, skills: 0, health: 0 };

        if (hasEntry) {
            daysLogged.push(day);
            weekAgg.diaryDays++;
            const dayAgg = aggregateActivities(entry.activities);
            weekAgg.prayerMins           += dayAgg.prayerMins;
            weekAgg.bibleStudyMins       += dayAgg.bibleStudyMins;
            weekAgg.bookPages            += dayAgg.bookPages;
            weekAgg.waterMl              += dayAgg.waterMl;
            weekAgg.exerciseMins         += dayAgg.exerciseMins;
            weekAgg.codingSessions       += dayAgg.codingSessions;
            weekAgg.fastingDays          += dayAgg.fastingDays;
            weekAgg.baseTrainingSessions += dayAgg.baseTrainingSessions;
            ['spiritual','skills','health','general'].forEach(c => {
                weekAgg.catMins[c] += dayAgg.catMins[c];
                if (dayMins[c] !== undefined) dayMins[c] = dayAgg.catMins[c];
            });
            weekAgg.totalMins += dayAgg.totalMins;
        }

        const dayTotalMins = dayMins.spiritual + dayMins.skills + dayMins.health;
        gridHtml += `
            <div class="week-day ${isToday ? 'today' : ''} ${hasEntry ? 'has-entry' : 'no-entry'}">
                <div class="day-label">${dayNames[d.getDay()]}</div>
                <div class="day-date">${d.getDate()}</div>
                <div class="day-dots">
                    ${dayMins.spiritual > 0 ? `<span class="dot dot-spiritual" title="Spiritual: ${minsToDisplay(dayMins.spiritual)}"></span>` : ''}
                    ${dayMins.skills    > 0 ? `<span class="dot dot-skills"    title="Skills: ${minsToDisplay(dayMins.skills)}"></span>` : ''}
                    ${dayMins.health    > 0 ? `<span class="dot dot-health"    title="Health: ${minsToDisplay(dayMins.health)}"></span>` : ''}
                </div>
                <div class="day-count">${hasEntry ? minsToDisplay(dayTotalMins) : '—'}</div>
            </div>
        `;
    });
    gridHtml += '</div>';

    // Weekly baselines
    const weeklyPrayerBaseline   = BASELINES.prayer * 7;      // 14hrs
    const weeklyBibleBaseline    = BASELINES.bibleStudy * 7;  // 3.5hrs
    const weeklyExerciseBaseline = BASELINES.exercise * 7;    // 3.5hrs

    const prayerPct   = baselinePct(weekAgg.prayerMins,     weeklyPrayerBaseline);
    const biblePct    = baselinePct(weekAgg.bibleStudyMins, weeklyBibleBaseline);
    const exercisePct = baselinePct(weekAgg.exerciseMins,   weeklyExerciseBaseline);
    const codingPct   = baselinePct(weekAgg.codingSessions, BASELINES.coding);       // 3 sessions/wk
    const trainPct    = baselinePct(weekAgg.baseTrainingSessions, BASELINES.baseTraining); // 3/wk
    const diaryPct    = baselinePct(weekAgg.diaryDays, 7);

    // AI prompt
    const aiPrompt = [
        `Weekly diary summary for Pastor Fire:`,
        `- Prayer: ${minsToDisplay(weekAgg.prayerMins)} / 14hrs baseline (${prayerPct}%)`,
        `- Bible Study: ${minsToDisplay(weekAgg.bibleStudyMins)} / 3.5hrs baseline (${biblePct}%)`,
        weekAgg.bookPages > 0 ? `- Reading: ${weekAgg.bookPages} pages this week` : '',
        weekAgg.waterMl > 0 ? `- Water avg: ${((weekAgg.waterMl/1000)/weekAgg.diaryDays).toFixed(1)}L/day` : '',
        `- Exercise: ${minsToDisplay(weekAgg.exerciseMins)} / 3.5hrs baseline (${exercisePct}%)`,
        `- Coding sessions: ${weekAgg.codingSessions} / 3 baseline (${codingPct}%)`,
        `- Base training sessions: ${weekAgg.baseTrainingSessions} / 3 baseline (${trainPct}%)`,
        `- Diary logged: ${weekAgg.diaryDays}/7 days (${diaryPct}%)`,
        weekAgg.fastingDays > 0 ? `- Fasting: ${weekAgg.fastingDays} day(s) this week` : '',
        `\nGive a 3-4 sentence weekly performance review. Be warm and pastoral in tone. ` +
        `Highlight strengths, note what needs work. ` +
        `Compare prayer hours to the 14hr weekly standard. Mention consistency of diary updates. ` +
        `End with an encouraging word for the coming week.`
    ].filter(Boolean).join('\n');

    container.innerHTML = `
        ${renderCategoryCards(weekAgg.catMins, weekAgg.totalMins)}
        <div class="section-title mt-1">📅 7-Day Calendar</div>
        ${gridHtml}
        <div class="section-title mt-1">📊 Weekly Performance vs Baselines</div>
        <div class="baseline-list">
            ${renderBaselineRow('🙏', 'Prayer',   minsToDisplay(weekAgg.prayerMins),     prayerPct,   'var(--color-spiritual)', `Baseline: 14hrs/week (2hrs × 7)`)}
            ${renderBaselineRow('📖', 'Bible Study', minsToDisplay(weekAgg.bibleStudyMins), biblePct, 'var(--color-spiritual)', `Baseline: 3.5hrs/week (30min × 7)`)}
            ${weekAgg.bookPages > 0 ? renderBaselineRow('📚', 'Reading', `${weekAgg.bookPages} pages`, baselinePct(weekAgg.bookPages, BASELINES.bookPages * 7), 'var(--color-skills)', `Baseline: ${BASELINES.bookPages * 7} pages/week`) : ''}
            ${renderBaselineRow('💪', 'Exercise', minsToDisplay(weekAgg.exerciseMins),    exercisePct, 'var(--color-health)', `Baseline: 3.5hrs/week`)}
            ${renderBaselineRow('💻', 'Coding',   `${weekAgg.codingSessions} sessions`,   codingPct,   'var(--color-skills)', `Baseline: 3 sessions/week`)}
            ${renderBaselineRow('🏋️', 'Base Training', `${weekAgg.baseTrainingSessions} sessions`, trainPct, 'var(--color-health)', `Baseline: 3 sessions/week`)}
            ${renderBaselineRow('📔', 'Diary Updates', `${weekAgg.diaryDays}/7 days`,     diaryPct,    '#059669', `Baseline: daily`)}
            ${weekAgg.fastingDays > 0 ? renderBaselineRow('🕊️', 'Fasting', `${weekAgg.fastingDays} day(s)`, Math.round((weekAgg.fastingDays/3)*100), '#7c3aed', 'Monthly baseline: 3 days') : ''}
        </div>
        <div class="ai-commentary-box" id="weekly-ai-box">
            <div class="ai-commentary-header">🤖 AI Weekly Coach</div>
            <div id="weekly-ai-text" class="ai-commentary-loading">Generating weekly review…</div>
        </div>
    `;

    // Load AI commentary
    const commentary = await getAICommentary(aiPrompt);
    const aiEl = document.getElementById('weekly-ai-text');
    if (aiEl) {
        aiEl.className = 'ai-commentary-text';
        aiEl.textContent = commentary || generateFallbackWeeklyCommentary(weekAgg, prayerPct, diaryPct);
    }
}

function generateFallbackWeeklyCommentary(agg, prayerPct, diaryPct) {
    const lines = [];
    if (prayerPct >= 100) lines.push(`🙏 Phenomenal — you hit your full 14-hour weekly prayer goal! That's a powerful foundation.`);
    else if (prayerPct >= 50) lines.push(`🙏 You reached ${prayerPct}% of your 14hr prayer goal. That's solid effort — keep pushing toward the full baseline.`);
    else lines.push(`🙏 Prayer time was ${prayerPct}% of the 14hr weekly goal. Try to carve out more dedicated prayer time each morning.`);

    if (diaryPct >= 100) lines.push('📔 Perfect diary consistency this week — that discipline is building a powerful habit!');
    else if (diaryPct >= 70) lines.push(`📔 You logged ${agg.diaryDays} of 7 days. Great consistency — try to close the gap next week.`);
    else lines.push(`📔 Diary was updated ${agg.diaryDays}/7 days. Daily logging helps you stay accountable — prioritise it.`);

    if (agg.codingSessions >= BASELINES.coding) lines.push('💻 Coding sessions baseline met — great skill investment!');
    if (agg.exerciseMins >= BASELINES.exercise * 7) lines.push('💪 Full exercise baseline hit this week — your health is a priority!');

    lines.push('A new week is ahead — bring everything you\'ve got. God\'s mercies are new every morning!');
    return lines.join(' ');
}

// ─── Monthly Review ───────────────────────────────────────────────────────────
async function renderMonthlyReview() {
    const container = document.getElementById('monthly-content');
    container.innerHTML = '<div class="empty-state"><span>⏳</span><p>Loading from Supabase…</p></div>';

    const entries    = await storage.getMonthEntries();
    const today      = new Date();
    const daysSoFar  = today.getDate();
    const monthName  = today.toLocaleString('default', { month: 'long', year: 'numeric' });

    const monthAgg = {
        prayerMins:      0,
        bibleStudyMins:  0,
        bookPages:       0,
        waterMl:         0,
        exerciseMins:    0,
        codingSessions:  0,
        fastingDays:     0,
        baseTrainingSessions: 0,
        diaryDays:       0,
        catMins:         { spiritual: 0, skills: 0, health: 0, general: 0 },
        totalMins:       0,
        bibleTopics:     [],
    };

    Object.values(entries).forEach(entry => {
        if (!entry.activities || entry.activities.length === 0) return;
        monthAgg.diaryDays++;
        const dayAgg = aggregateActivities(entry.activities);
        monthAgg.prayerMins           += dayAgg.prayerMins;
        monthAgg.bibleStudyMins       += dayAgg.bibleStudyMins;
        monthAgg.bookPages            += dayAgg.bookPages;
        monthAgg.waterMl              += dayAgg.waterMl;
        monthAgg.exerciseMins         += dayAgg.exerciseMins;
        monthAgg.codingSessions       += dayAgg.codingSessions;
        monthAgg.fastingDays          += dayAgg.fastingDays;
        monthAgg.baseTrainingSessions += dayAgg.baseTrainingSessions;
        ['spiritual','skills','health','general'].forEach(c => {
            monthAgg.catMins[c] += dayAgg.catMins[c];
        });
        monthAgg.totalMins += dayAgg.totalMins;
    });

    const consistency = Math.round((monthAgg.diaryDays / daysSoFar) * 100);

    // Monthly baselines
    const monthlyPrayerBaseline   = BASELINES.prayer * daysSoFar;      // 2hrs × days
    // Special celebrated milestone: 60hrs prayer/month
    const prayerHrs    = monthAgg.prayerMins / 60;
    const prayerMilestone = prayerHrs >= 60;
    const prayerPct    = baselinePct(monthAgg.prayerMins, monthlyPrayerBaseline);
    const biblePct     = baselinePct(monthAgg.bibleStudyMins, BASELINES.bibleStudy * daysSoFar);
    const exercisePct  = baselinePct(monthAgg.exerciseMins,   BASELINES.exercise * daysSoFar);
    const fastingPct   = baselinePct(monthAgg.fastingDays,    BASELINES.fasting);  // 3 days/month
    const diaryPct     = consistency;

    // Weeks elapsed for coding/training
    const weeksElapsed = Math.max(1, Math.ceil(daysSoFar / 7));
    const codingPct    = baselinePct(monthAgg.codingSessions,      BASELINES.coding * weeksElapsed);
    const trainPct     = baselinePct(monthAgg.baseTrainingSessions, BASELINES.baseTraining * weeksElapsed);

    const aiPrompt = [
        `Monthly diary summary for Pastor Fire — ${monthName}:`,
        `- Prayer: ${prayerHrs.toFixed(1)}hrs (baseline: 60hrs/month, actual %: ${prayerPct}%)`,
        prayerMilestone ? '  🎉 MILESTONE: 60hrs prayer goal ACHIEVED this month!' : '',
        `- Bible Study: ${minsToDisplay(monthAgg.bibleStudyMins)} (${biblePct}% of baseline)`,
        monthAgg.bookPages > 0 ? `- Reading: ${monthAgg.bookPages} total pages this month` : '',
        `- Exercise: ${minsToDisplay(monthAgg.exerciseMins)} (${exercisePct}% of baseline)`,
        `- Fasting: ${monthAgg.fastingDays} days / 3-day baseline (${fastingPct}%)`,
        `- Coding: ${monthAgg.codingSessions} sessions (${codingPct}% of baseline)`,
        `- Base Training: ${monthAgg.baseTrainingSessions} sessions (${trainPct}%)`,
        `- Diary Consistency: ${monthAgg.diaryDays}/${daysSoFar} days (${diaryPct}%)`,
        `\nWrite a 4-5 sentence monthly performance review in a warm pastoral tone. ` +
        `Celebrate the 60hr prayer milestone if achieved. ` +
        `Comment on Bible study topics and suggest areas for next month. ` +
        `Compare reading to high-performing leaders who read heavily (like reading 1-2 books per month). ` +
        `Be specific about fasting consistency. End with a powerful motivational close for the month ahead.`
    ].filter(Boolean).join('\n');

    container.innerHTML = `
        <div class="month-header"><h3>${monthName}</h3></div>
        ${prayerMilestone ? `<div class="milestone-banner">🎉 PRAYER MILESTONE: You've hit 60 hours of prayer this month! This is a celebration!</div>` : ''}
        ${renderCategoryCards(monthAgg.catMins, monthAgg.totalMins)}
        <div class="section-title mt-1">📈 Monthly Performance vs Baselines</div>
        <div class="baseline-list">
            ${renderBaselineRow('🙏', 'Prayer', `${prayerHrs.toFixed(1)}hrs`, prayerPct, 'var(--color-spiritual)', `Baseline: 60hrs/month (2hrs × days)`)}
            ${renderBaselineRow('📖', 'Bible Study', minsToDisplay(monthAgg.bibleStudyMins), biblePct, 'var(--color-spiritual)', `Baseline: 30mins × ${daysSoFar} days`)}
            ${monthAgg.bookPages > 0 ? renderBaselineRow('📚', 'Reading', `${monthAgg.bookPages} pages`, baselinePct(monthAgg.bookPages, BASELINES.bookPages * daysSoFar), 'var(--color-skills)', `Baseline: ${BASELINES.bookPages * daysSoFar} pages this month`) : ''}
            ${renderBaselineRow('💪', 'Exercise', minsToDisplay(monthAgg.exerciseMins), exercisePct, 'var(--color-health)', `Baseline: 30mins × ${daysSoFar} days`)}
            ${renderBaselineRow('🕊️', 'Fasting', `${monthAgg.fastingDays} day(s)`, fastingPct, '#7c3aed', 'Baseline: 3 days/month')}
            ${renderBaselineRow('💻', 'Coding', `${monthAgg.codingSessions} sessions`, codingPct, 'var(--color-skills)', `Baseline: 3 sessions/week`)}
            ${renderBaselineRow('🏋️', 'Base Training', `${monthAgg.baseTrainingSessions} sessions`, trainPct, 'var(--color-health)', `Baseline: 3 sessions/week`)}
            ${renderBaselineRow('📔', 'Diary Consistency', `${monthAgg.diaryDays}/${daysSoFar} days`, diaryPct, '#059669', 'Baseline: daily')}
        </div>
        <div class="ai-commentary-box" id="monthly-ai-box">
            <div class="ai-commentary-header">🤖 AI Monthly Coach</div>
            <div id="monthly-ai-text" class="ai-commentary-loading">Generating monthly review…</div>
        </div>
    `;

    const commentary = await getAICommentary(aiPrompt);
    const aiEl = document.getElementById('monthly-ai-text');
    if (aiEl) {
        aiEl.className = 'ai-commentary-text';
        aiEl.textContent = commentary || generateFallbackMonthlyCommentary(monthAgg, prayerPct, prayerMilestone, fastingPct, diaryPct);
    }
}

function generateFallbackMonthlyCommentary(agg, prayerPct, milestone, fastingPct, diaryPct) {
    const lines = [];
    const prayerHrs = (agg.prayerMins / 60).toFixed(1);

    if (milestone) {
        lines.push(`🎉 CELEBRATION: You have reached 60 hours of prayer this month — this is a spiritual achievement worth celebrating! God honours a praying heart.`);
    } else if (prayerPct >= 70) {
        lines.push(`🙏 Strong prayer month — ${prayerHrs}hrs logged (${prayerPct}% of the 60hr goal). You're building a powerful prayer life.`);
    } else {
        lines.push(`🙏 Prayer time was ${prayerHrs}hrs this month (${prayerPct}% of the 60hr baseline). Make prayer the first priority — it shifts everything else.`);
    }

    if (agg.bookPages > 0) {
        lines.push(`📚 You read ${agg.bookPages} pages this month. Leaders like those who read extensively invest in their mind daily — keep building that habit.`);
    } else {
        lines.push(`📚 No book reading was logged this month. Consider starting with 20 pages a day — that's roughly a book a month and will transform your thinking.`);
    }

    if (fastingPct >= 100) lines.push(`🕊️ Fasting goal met — all 3 days completed. This discipline sharpens your spiritual sensitivity.`);
    else if (agg.fastingDays > 0) lines.push(`🕊️ ${agg.fastingDays} of 3 fasting days done — good start, aim for the full 3 next month.`);
    else lines.push(`🕊️ No fasting logged this month. Consider incorporating 3 days of fasting — it deepens your spiritual discipline.`);

    if (diaryPct >= 80) lines.push(`📔 Excellent diary consistency (${diaryPct}%) — that discipline is tracking your growth beautifully.`);

    lines.push('Enter the new month with intention and faith. Your consistency today is building the leader of tomorrow!');
    return lines.join(' ');
}

// ─── OCR / Photo Upload ───────────────────────────────────────────────────────
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

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) processOcrFile(file);
}

async function processOcrFile(file) {
    const preview = document.getElementById('photo-preview');
    const reader  = new FileReader();
    reader.onload  = e => { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);

    document.getElementById('ocr-result').style.display   = 'none';
    document.getElementById('ocr-progress').style.display = 'block';
    document.getElementById('import-btn').style.display   = 'none';

    const onStatus   = (msg) => {
        const el  = document.getElementById('ocr-status');
        const bar = document.getElementById('ocr-progress-bar');
        if (el)  el.textContent    = msg;
        if (bar) bar.style.width   = '70%';
    };
    const onProgress = (p) => {
        const bar = document.getElementById('ocr-progress-bar');
        const el  = document.getElementById('ocr-status');
        if (bar) bar.style.width  = (p.progress * 100) + '%';
        if (el)  el.textContent   = p.status || 'Processing…';
    };

    try {
        const result = await ocr.processImage(file, { onStatus, onProgress });
        const bar = document.getElementById('ocr-progress-bar');
        if (bar) bar.style.width = '100%';
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
        ? '<li class="empty-state-small">No activities detected. Try a clearer photo.</li>'
        : result.activities.map(a => `
            <li class="ocr-activity-item cat-${a.category}">
                <span>${a.time || '—'}</span>
                <span>${a.activity}</span>
                <span>${a.duration || ''}</span>
                <span class="act-cat-badge cat-badge-${a.category}">${a.category}</span>
            </li>
        `).join('');
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

// ─── Dropdown toggle ─────────────────────────────────────────────────────────
function toggleDropdown(id) {
    const menu = document.getElementById(id);
    document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m.id !== id) m.classList.remove('open');
    });
    menu.classList.toggle('open');
}
document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
    }
});

// ─── Export as PDF ────────────────────────────────────────────────────────────
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
        doc.setFontSize(10); doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, y); y += 10;

        dates.forEach(date => {
            const entry = entries[date];
            if (!entry.activities || entry.activities.length === 0) return;
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setFontSize(13); doc.setTextColor(15, 52, 96);
            doc.text(date, 20, y); y += 8;

            const agg = aggregateActivities(entry.activities);
            doc.setFontSize(9); doc.setTextColor(80);
            if (agg.prayerMins > 0) { doc.text(`🙏 Prayer: ${minsToDisplay(agg.prayerMins)}`, 25, y); y += 5; }

            entry.activities.forEach(a => {
                if (y > 270) { doc.addPage(); y = 20; }
                doc.setFontSize(9); doc.setTextColor(40);
                doc.text(`  ${a.time || '--'} | ${a.activity} | ${a.duration || ''}`, 25, y);
                y += 5;
            });
            y += 4;
        });

        doc.save('diary-report.pdf');
        showToast('PDF exported ✅', 'success');
    } catch (e) {
        console.error(e);
        showToast('PDF export failed', 'error');
    }
}

// ─── Export as Image ──────────────────────────────────────────────────────────
async function exportAsImage(format) {
    document.getElementById('export-dropdown').classList.remove('open');
    showToast('Capturing image…', 'info');
    try {
        const el      = document.querySelector('.tab-content.active');
        const canvas  = await html2canvas(el, { scale: 2 });
        const imgData = canvas.toDataURL(`image/${format}`);
        const link    = document.createElement('a');
        link.href     = imgData;
        link.download = `diary-export.${format}`;
        link.click();
        showToast(`${format.toUpperCase()} exported ✅`, 'success');
    } catch (e) {
        console.error(e);
        showToast('Image export failed', 'error');
    }
}

// ─── Import ───────────────────────────────────────────────────────────────────
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
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
        }
        const result = ocr.parseText(text);
        extractedOcrData = result;
        showTab('photo');
        displayOcrResult(result);
        showToast('PDF parsed ✅', 'success');
    } catch (e) {
        showToast('PDF import failed: ' + e.message, 'error');
    }
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
    toast._timer = setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    storage.init();
    loadDailyScripture();
    setupDropzone();

    // Set today's date
    document.getElementById('entry-date').value = new Date().toISOString().slice(0, 10);
    addActivityField();

    // Load entry info when date changes
    document.getElementById('entry-date').addEventListener('change', loadEntryForDate);

    // Show daily tab by default
    renderDailySummary();
});
