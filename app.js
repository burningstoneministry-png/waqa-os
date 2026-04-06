// app.js - Main application logic

// ─── Login ────────────────────────────────────────────────────────────────────
const LOGIN_USER = 'Waqa26';
const LOGIN_PASS = 'K1mb02198';
const SESSION_KEY = 'dt_session_v1';

function checkSession() {
    return sessionStorage.getItem(SESSION_KEY) === 'authenticated';
}

function attemptLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;
    const err  = document.getElementById('login-error');

    if (user === LOGIN_USER && pass === LOGIN_PASS) {
        sessionStorage.setItem(SESSION_KEY, 'authenticated');
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-root').style.display     = 'block';
        err.style.display = 'none';
        initApp();
    } else {
        err.style.display = 'block';
        document.getElementById('login-password').value = '';
        document.getElementById('login-password').focus();
        // Shake animation
        const card = document.querySelector('.login-card');
        card.classList.remove('shake');
        void card.offsetWidth; // reflow
        card.classList.add('shake');
    }
}

function togglePasswordVisibility() {
    const pw  = document.getElementById('login-password');
    const eye = document.querySelector('.login-eye');
    if (pw.type === 'password') {
        pw.type = 'text';
        eye.textContent = '🙈';
    } else {
        pw.type = 'password';
        eye.textContent = '👁';
    }
}

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
}

let activityCount  = 0;
let expenseCount   = 0;
let incomeCount    = 0;
let currentTab     = 'write';
let extractedOcrData  = null;
let aiCoachOpen       = false;
let yearlyAllEntries  = {};   // cache for yearly data
let yearlyActiveMonth = 'all';
let yearlyActiveFilter = 'all';
let runningBalance    = null;  // cached running balance from last known entry

// ─── Baselines ────────────────────────────────────────────────────────────────
const BASELINES = {
    prayer:            120,   // 2hrs/day (mins)
    bibleStudy:        30,    // 30mins/day
    bookPages:         20,    // 20 pages/day
    water:             1500,  // 1.5L/day (ml)
    exercise:          30,    // 30mins/day
    coding:            300,   // 5hrs/week (mins)
    fasting:           3,     // 3 days/month
    baseTraining:      3,     // 3 sessions/week
    keyboard:          1,     // 1 session/week (1hr)
    bass:              1,     // 1 session/week (1hr)
    diaryWeek:         5,     // 5 logs/week
    diaryMonth:        20,    // 20 logs/month
};

// ─── Vision & Mission (Life Blueprint) ───────────────────────────────────────
// This is Pastor Fire's life vision — stored here so every AI response can
// measure his daily execution against it and challenge him accordingly.
const PASTOR_FIRE_VISION = `
PASTOR FIRE'S LIFE VISION & MISSION (measure all diary activity against this):

MISSION (Daily Execution Target):
To build innovative, technology-driven businesses that generate sustainable wealth,
advance cutting-edge engineering (including flying transportation systems), and fund
a global evangelism movement that reaches nations with the Gospel of Jesus Christ.
He operates at the intersection of: Technology (IT, AI, engineering) + Business
(income, systems, scalability) + Kingdom impact (evangelism, revival, discipleship).

VISION (Long-term Build):
1. FLYING CAR TECHNOLOGY — Develop affordable eVTOL (electric vertical takeoff and
   landing) systems for island nations like Fiji. Solve traffic, geography, emergency
   response. Phase 1 (Now–3yrs): IT services + coding + electronics skills.
   Phase 2 (3–7yrs): Drones, battery systems, autonomous vehicles.
   Phase 3 (7–15yrs): Full eVTOL flying car development.
   Phase 4 (15+yrs): Pacific aerospace company, global export.

2. FUND GLOBAL EVANGELISM — Finance reaching 1 billion souls to Christ. Build media
   platforms, training systems, global outreach. Support pastors worldwide.

3. REACTOR OF REVIVAL — 24/7 prayer and worship on the Prayer Mountain. National
   and global revival engine. Disciple training and sending center.

4. RAISE A NEW GENERATION — Equip children and others with discipline, technical
   skills, and spiritual grounding. Build leaders for both technology and truth.

BUSINESS ENGINE (Income → Engineering → Ministry):
  IT Services (fast cash) → E-commerce → Transport/Uber → Farming → Tech R&D
  All profits feed: Engineering development + Ministry funding + Land/infrastructure

UNIQUE ADVANTAGES he already has:
  IT & networking skills | Business mindset | Ministry connection | Land (huge asset)
  | Vision beyond normal thinking — combining ALL of them.

SKILLS BEING BUILT (critical for Phase 1):
  Programming (Python, embedded systems) | Electronics | AI + automation
  Keyboard/piano skills | Bass guitar | Physical fitness (Base Training)
  Reading (business, tech, theology leaders)

DAILY EXECUTION STANDARD:
  Every day must move the needle on at least ONE of: prayer/spiritual depth,
  technical skill-building (coding/electronics), business income, physical fitness,
  or reading/learning. Diary consistency itself is a discipline metric.
`;


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

// ─── Health Status ────────────────────────────────────────────────────────────
function selectHealthStatus(status, btn) {
    document.querySelectorAll('.health-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('health-status').value = status;
    const sickRow = document.getElementById('sick-days-row');
    sickRow.style.display = (status === 'sick' || status === 'recovering') ? 'flex' : 'none';
}

function resetHealthStatus() {
    document.querySelectorAll('.health-pill').forEach(p => p.classList.remove('active'));
    const healthyBtn = document.querySelector('.health-pill[data-status="healthy"]');
    if (healthyBtn) healthyBtn.classList.add('active');
    document.getElementById('health-status').value = 'healthy';
    document.getElementById('sick-days-count').value = '1';
    document.getElementById('sick-days-row').style.display = 'none';
}

function loadHealthStatus(healthData) {
    const status = (healthData && healthData.status) || 'healthy';
    document.querySelectorAll('.health-pill').forEach(p => p.classList.remove('active'));
    const pill = document.querySelector(`.health-pill[data-status="${status}"]`);
    if (pill) pill.classList.add('active');
    document.getElementById('health-status').value = status;
    const sickRow = document.getElementById('sick-days-row');
    if (status === 'sick' || status === 'recovering') {
        sickRow.style.display = 'flex';
        document.getElementById('sick-days-count').value = (healthData && healthData.sickDays) || 1;
    } else {
        sickRow.style.display = 'none';
    }
}

// ─── Running Balance ──────────────────────────────────────────────────────────
async function loadRunningBalance() {
    // Fetch the last 60 days of entries to compute the running balance
    const today = new Date();
    const from  = new Date(today); from.setDate(from.getDate() - 60);
    const toStr   = today.toISOString().slice(0, 10);
    const fromStr = from.toISOString().slice(0, 10);
    const entries = await storage.getEntriesInRange(fromStr, toStr);

    let balance = 0;
    let hasAny  = false;
    // Sort dates ascending
    Object.keys(entries).sort().forEach(date => {
        const e = entries[date];
        if (!e.finances) return;
        const { bankBalance, income = [], expenses = [] } = e.finances;
        const totalInc = income.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
        const totalExp = expenses.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
        if (bankBalance !== '' && bankBalance !== null && bankBalance !== undefined) {
            // Manual override — set as new base then apply income/expenses from same entry
            balance = parseFloat(bankBalance) + totalInc - totalExp;
        } else {
            balance += totalInc - totalExp;
        }
        hasAny = true;
    });

    runningBalance = hasAny ? balance : null;
    const el = document.getElementById('running-balance-display');
    if (el) {
        if (runningBalance !== null) {
            el.innerHTML = `<span class="rb-label">Running balance:</span> <span class="rb-amount ${runningBalance < 0 ? 'rb-neg' : 'rb-pos'}">${formatCurrency(runningBalance)}</span>`;
        } else {
            el.innerHTML = `<span class="rb-label">No balance history yet.</span>`;
        }
    }
    return runningBalance;
}

// Compute running balance up to a given date from a set of entries (for display)
function computeRunningBalance(entries) {
    let balance = 0;
    Object.keys(entries).sort().forEach(date => {
        const e = entries[date];
        if (!e || !e.finances) return;
        const { bankBalance, income = [], expenses = [] } = e.finances;
        const totalInc = income.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
        const totalExp = expenses.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
        if (bankBalance !== '' && bankBalance !== null && bankBalance !== undefined) {
            balance = parseFloat(bankBalance) + totalInc - totalExp;
        } else {
            balance += totalInc - totalExp;
        }
    });
    return balance;
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
    const healthStatus = document.getElementById('health-status').value || 'healthy';
    const sickDaysEl   = document.getElementById('sick-days-count');
    const health = {
        status:   healthStatus,
        sickDays: (healthStatus === 'sick' || healthStatus === 'recovering')
                    ? (parseInt(sickDaysEl.value) || 1) : 0
    };
    const sleep = {
        wakeTime:    document.getElementById('wake-time').value   || '',
        wakeReason:  document.getElementById('wake-reason').value  || '',
        sleepTime:   document.getElementById('sleep-time').value  || '',
        sleepReason: document.getElementById('sleep-reason').value || '',
    };

    showToast('Saving…', 'info');
    const saved = await storage.saveEntry(date, { activities, food, finances, review, health, sleep });
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
    document.getElementById('entry-date').value    = new Date().toISOString().slice(0, 10);
    document.getElementById('wake-time').value      = '';
    document.getElementById('wake-reason').value    = '';
    document.getElementById('sleep-time').value     = '';
    document.getElementById('sleep-reason').value   = '';
    window._editingFullList = null;
    resetHealthStatus();
    loadRunningBalance();
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

    // Load health status
    loadHealthStatus(entry.health || null);

    // Load sleep schedule
    if (entry.sleep) {
        document.getElementById('wake-time').value    = entry.sleep.wakeTime    || '';
        document.getElementById('wake-reason').value  = entry.sleep.wakeReason  || '';
        document.getElementById('sleep-time').value   = entry.sleep.sleepTime   || '';
        document.getElementById('sleep-reason').value = entry.sleep.sleepReason || '';
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
        exerciseMins: 0, codingMins: 0, codingSessions: 0, fastingDays: 0, baseTrainingSessions: 0,
        keyboardSessions: 0, bassSessions: 0,
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
        else if (name.includes('coding') || name.includes('code')) { result.codingSessions += 1; result.codingMins += mins; }
        else if (name.includes('fast') || name.includes('fasting'))       result.fastingDays += 1;
        // Music skills
        if (name.includes('keyboard') || name.includes('piano'))          result.keyboardSessions += 1;
        if (name.includes('bass'))                                         result.bassSessions += 1;
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
// ─── Sleep Schedule Display ───────────────────────────────────────────────────
const SLEEP_TARGETS = { wake: '04:00', sleep: '22:00' }; // 4AM wake, 10PM sleep

function formatTime12(time24) {
    if (!time24) return null;
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function sleepTimeDiff(actual, target) {
    // Returns diff in minutes (positive = late, negative = early)
    if (!actual || !target) return null;
    const [ah, am] = actual.split(':').map(Number);
    const [th, tm] = target.split(':').map(Number);
    return (ah * 60 + am) - (th * 60 + tm);
}

function renderSleepRow(sleep) {
    if (!sleep || (!sleep.wakeTime && !sleep.sleepTime)) return '';
    const wakeDiff  = sleepTimeDiff(sleep.wakeTime,  SLEEP_TARGETS.wake);
    const sleepDiff = sleepTimeDiff(sleep.sleepTime, SLEEP_TARGETS.sleep);

    const wakeTag = wakeDiff !== null
        ? (wakeDiff > 15
            ? `<span class="sleep-tag late">+${Math.round(wakeDiff)}min late</span>`
            : wakeDiff < -15
                ? `<span class="sleep-tag early">${Math.abs(Math.round(wakeDiff))}min early 🎉</span>`
                : `<span class="sleep-tag ontime">On time ✅</span>`)
        : '';

    const sleepTag = sleepDiff !== null
        ? (sleepDiff > 15
            ? `<span class="sleep-tag late">+${Math.round(sleepDiff)}min late</span>`
            : sleepDiff < -15
                ? `<span class="sleep-tag early">${Math.abs(Math.round(sleepDiff))}min early 🎉</span>`
                : `<span class="sleep-tag ontime">On time ✅</span>`)
        : '';

    return `<div class="sleep-summary-row">
        ${sleep.wakeTime ? `
        <div class="sleep-summary-item">
            <span class="sleep-sum-icon">🌅</span>
            <div>
                <div class="sleep-sum-time">${formatTime12(sleep.wakeTime)} ${wakeTag}</div>
                <div class="sleep-sum-label">Wake Up${sleep.wakeReason ? ` — ${sleep.wakeReason}` : ''}</div>
            </div>
        </div>` : ''}
        ${sleep.sleepTime ? `
        <div class="sleep-summary-item">
            <span class="sleep-sum-icon">🌙</span>
            <div>
                <div class="sleep-sum-time">${formatTime12(sleep.sleepTime)} ${sleepTag}</div>
                <div class="sleep-sum-label">Sleep${sleep.sleepReason ? ` — ${sleep.sleepReason}` : ''}</div>
            </div>
        </div>` : ''}
    </div>`;
}

// ─── Health Badge ─────────────────────────────────────────────────────────────
function renderHealthBadge(health) {
    if (!health || health.status === 'healthy') return '';
    const map = {
        sick:       { icon: '🤒', label: 'Sick',       cls: 'health-badge-sick'       },
        recovering: { icon: '💊', label: 'Recovering', cls: 'health-badge-recovering' },
        travelling: { icon: '✈️', label: 'Travelling', cls: 'health-badge-travelling' },
        rest:       { icon: '😴', label: 'Rest Day',   cls: 'health-badge-rest'       },
    };
    const info = map[health.status] || { icon: '🩺', label: health.status, cls: 'health-badge-sick' };
    const daysNote = (health.status === 'sick' || health.status === 'recovering') && health.sickDays > 0
        ? ` — Day ${health.sickDays}` : '';
    return `<div class="health-badge ${info.cls}">${info.icon} ${info.label}${daysNote}</div>`;
}

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
    const finances = entry.finances || { expenses: [], income: [], bankBalance: '' };
    const health   = entry.health   || { status: 'healthy', sickDays: 0 };
    const sleep    = entry.sleep    || { wakeTime: '', wakeReason: '', sleepTime: '', sleepReason: '' };
    const waterMl  = parseWaterMl(food.water);
    const totalSpent  = (finances.expenses || []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const totalIncome = (finances.income   || []).reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

    // Compute running balance for today using last 60 days
    const today60From = new Date(); today60From.setDate(today60From.getDate() - 60);
    const recentEntries = await storage.getEntriesInRange(today60From.toISOString().slice(0, 10), today);
    const todayRunningBal = computeRunningBalance(recentEntries);

    // Finance cards in heading
    if (finCards) finCards.innerHTML = renderFinanceCards(totalSpent, todayRunningBal);

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
        ${renderSleepRow(sleep)}
        ${renderHealthBadge(health)}
        ${entry.review ? `<div class="review-box"><strong>Reflection:</strong> ${entry.review}</div>` : ''}
        <div class="ai-commentary-box">
            <div class="ai-commentary-header">🤖 AI Daily Coach</div>
            <div id="daily-ai-text" class="ai-commentary-loading">Generating commentary…</div>
        </div>
    `;

    const healthNote = health.status !== 'healthy'
        ? `Health: ${health.status}${health.sickDays > 0 ? ` (day ${health.sickDays} of illness)` : ''}` : '';
    const wakeDiff  = sleepTimeDiff(sleep.wakeTime,  SLEEP_TARGETS.wake);
    const sleepDiff = sleepTimeDiff(sleep.sleepTime, SLEEP_TARGETS.sleep);
    const sleepNote = [
        sleep.wakeTime  ? `Wake up: ${formatTime12(sleep.wakeTime)} (target 4:00 AM${wakeDiff !== null ? `, ${wakeDiff > 0 ? '+' : ''}${Math.round(wakeDiff)}min` : ''})${sleep.wakeReason ? ` — reason: ${sleep.wakeReason}` : ''}` : '',
        sleep.sleepTime ? `Sleep:    ${formatTime12(sleep.sleepTime)} (target 10:00 PM${sleepDiff !== null ? `, ${sleepDiff > 0 ? '+' : ''}${Math.round(sleepDiff)}min` : ''})${sleep.sleepReason ? ` — reason: ${sleep.sleepReason}` : ''}` : '',
    ].filter(Boolean).join('\n');

    const aiPrompt = [
        `Daily diary for Pastor Fire (${today}):`,
        `Prayer: ${minsToDisplay(agg.prayerMins)} (${prayerPct}% of 2hr baseline)`,
        `Bible Study: ${minsToDisplay(agg.bibleStudyMins)} (${biblePct}%)`,
        `Exercise: ${minsToDisplay(agg.exerciseMins)} (${exercisePct}%)`,
        food.water ? `Water: ${food.water} (${waterPct}%)` : '',
        hasMeals ? `Food: Breakfast="${food.breakfast}", Lunch="${food.lunch}", Dinner="${food.dinner}", Snacks="${food.snacks}"` : '',
        totalSpent > 0 ? `Spent: $${totalSpent.toFixed(2)}` : '',
        totalIncome > 0 ? `Income received: $${totalIncome.toFixed(2)}` : '',
        `Running balance: $${todayRunningBal.toFixed(2)}`,
        healthNote,
        sleepNote,
        entry.review ? `Reflection: "${entry.review}"` : '',
        `\n${PASTOR_FIRE_VISION}\nGive a sharp 3-4 sentence daily coaching note. If wake time is later than 4:00 AM, call it out directly — early rising is non-negotiable for the mission. First, measure today's activities against the life vision above — did today move the needle toward the flying car mission, kingdom impact, or skill-building? Call out what was strong and what was missing. Be direct, pastoral, and inspiring. End with one bold challenge for tomorrow.`
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
        codingMins: 0, codingSessions: 0, fastingDays: 0, baseTrainingSessions: 0,
        keyboardSessions: 0, bassSessions: 0,
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
            weekAgg.codingMins           += dayAgg.codingMins;
            weekAgg.codingSessions       += dayAgg.codingSessions;
            weekAgg.fastingDays          += dayAgg.fastingDays;
            weekAgg.baseTrainingSessions += dayAgg.baseTrainingSessions;
            weekAgg.keyboardSessions     += dayAgg.keyboardSessions;
            weekAgg.bassSessions         += dayAgg.bassSessions;
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
    const codingPct   = baselinePct(weekAgg.codingMins,           BASELINES.coding);       // 300mins/week
    const trainPct    = baselinePct(weekAgg.baseTrainingSessions, BASELINES.baseTraining);
    const keyboardPct = baselinePct(weekAgg.keyboardSessions,     BASELINES.keyboard);
    const bassPct     = baselinePct(weekAgg.bassSessions,         BASELINES.bass);
    const diaryPct    = baselinePct(weekAgg.diaryDays,            BASELINES.diaryWeek);

    container.innerHTML = `
        ${renderCategoryCards(weekAgg.catMins, weekAgg.totalMins)}
        <div class="section-title mt-1">📅 7-Day Calendar</div>
        ${gridHtml}
        <div class="section-title mt-1">📊 Weekly Performance vs Baselines</div>
        <div class="baseline-list">
            ${renderBaselineRow('🙏', 'Prayer',        minsToDisplay(weekAgg.prayerMins),     prayerPct,   'var(--color-spiritual)', 'Baseline: 14hrs/week')}
            ${renderBaselineRow('📖', 'Bible Study',   minsToDisplay(weekAgg.bibleStudyMins), biblePct,    'var(--color-spiritual)', 'Baseline: 3.5hrs/week')}
            ${renderBaselineRow('💪', 'Exercise',      minsToDisplay(weekAgg.exerciseMins),   exercisePct, 'var(--color-health)',    'Baseline: 3.5hrs/week')}
            ${renderBaselineRow('💻', 'Coding',          minsToDisplay(weekAgg.codingMins),          codingPct,   'var(--color-skills)',   'Baseline: 5hrs/week')}
            ${renderBaselineRow('🏋️', 'Base Training',  `${weekAgg.baseTrainingSessions} sessions`,  trainPct,    'var(--color-health)',   'Baseline: 3 sessions/week')}
            ${renderBaselineRow('🎹', 'Keyboard',        `${weekAgg.keyboardSessions} sessions`,      keyboardPct, 'var(--color-skills)',   'Baseline: 3 sessions/week')}
            ${renderBaselineRow('🎸', 'Bass Guitar',     `${weekAgg.bassSessions} sessions`,          bassPct,     'var(--color-skills)',   'Baseline: 3 sessions/week')}
            ${renderBaselineRow('📔', 'Diary Updates',   `${weekAgg.diaryDays}/7 days`,               diaryPct,    '#059669',               'Baseline: 5 days/week')}
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

    const aiPrompt = `${PASTOR_FIRE_VISION}\nWeekly diary summary for Pastor Fire:\nPrayer: ${minsToDisplay(weekAgg.prayerMins)} (${prayerPct}% of 14hr baseline)\nBible Study: ${minsToDisplay(weekAgg.bibleStudyMins)} (${biblePct}%)\nExercise: ${minsToDisplay(weekAgg.exerciseMins)} (${exercisePct}%)\nCoding: ${minsToDisplay(weekAgg.codingMins)} (${codingPct}% of 5hr/week target)\nKeyboard: ${weekAgg.keyboardSessions} session(s) (${keyboardPct}% of 1/wk target)\nBass: ${weekAgg.bassSessions} session(s) (${bassPct}% of 1/wk target)\nBase Training: ${weekAgg.baseTrainingSessions} sessions (${trainPct}%)\nDiary logged: ${weekAgg.diaryDays}/7 days (${diaryPct}%)\nSpent: $${weekSpent.toFixed(2)}, Income: $${weekIncome.toFixed(2)}\n\nWrite a punchy 4-5 sentence weekly coaching challenge. Measure this week's execution against the life vision above. Score the week on spiritual depth, technical skill-building (coding/keyboard/bass), physical training, and financial discipline. Be honest — celebrate wins and name what was missing. End with a bold, specific challenge for next week tied to the flying car / kingdom vision.`;

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
        codingMins: 0, codingSessions: 0, fastingDays: 0, baseTrainingSessions: 0,
        keyboardSessions: 0, bassSessions: 0,
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
        monthAgg.codingMins           += dayAgg.codingMins;
        monthAgg.codingSessions       += dayAgg.codingSessions;
        monthAgg.fastingDays          += dayAgg.fastingDays;
        monthAgg.baseTrainingSessions += dayAgg.baseTrainingSessions;
        monthAgg.keyboardSessions     += dayAgg.keyboardSessions;
        monthAgg.bassSessions         += dayAgg.bassSessions;
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
    const codingPct    = baselinePct(monthAgg.codingMins,           BASELINES.coding       * weeksElapsed); // 300mins × weeks
    const keyboardPctM = baselinePct(monthAgg.keyboardSessions,    BASELINES.keyboard     * weeksElapsed);
    const bassPctM     = baselinePct(monthAgg.bassSessions,        BASELINES.bass         * weeksElapsed);

    container.innerHTML = `
        <div class="month-header"><h3>${monthName}</h3></div>
        ${milestone ? `<div class="milestone-banner">🎉 PRAYER MILESTONE: You've hit 60 hours of prayer this month — celebrate!</div>` : ''}
        ${renderCategoryCards(monthAgg.catMins, monthAgg.totalMins)}
        <div class="section-title mt-1">📈 Monthly Performance vs Baselines</div>
        <div class="baseline-list">
            ${renderBaselineRow('🙏', 'Prayer',        `${prayerHrs.toFixed(1)}hrs`,          prayerPct,   'var(--color-spiritual)', `Baseline: 60hrs/month (2hrs × days)`)}
            ${renderBaselineRow('📖', 'Bible Study',   minsToDisplay(monthAgg.bibleStudyMins), biblePct,   'var(--color-spiritual)', `Baseline: 30mins × ${daysSoFar} days`)}
            ${renderBaselineRow('💪', 'Exercise',      minsToDisplay(monthAgg.exerciseMins),   exercisePct,'var(--color-health)',    `Baseline: 30mins × ${daysSoFar} days`)}
            ${renderBaselineRow('🕊️', 'Fasting',       `${monthAgg.fastingDays} day(s)`,            fastingPct,  '#7c3aed',             'Baseline: 3 days/month')}
            ${renderBaselineRow('💻', 'Coding',        minsToDisplay(monthAgg.codingMins),          codingPct,   'var(--color-skills)', 'Baseline: 5hrs/week')}
            ${renderBaselineRow('🎹', 'Keyboard',      `${monthAgg.keyboardSessions} sessions`,     keyboardPctM,'var(--color-skills)', 'Baseline: 3 sessions/week')}
            ${renderBaselineRow('🎸', 'Bass Guitar',   `${monthAgg.bassSessions} sessions`,         bassPctM,    'var(--color-skills)', 'Baseline: 3 sessions/week')}
            ${renderBaselineRow('📔', 'Diary Consistency', `${monthAgg.diaryDays}/${daysSoFar} days`, diaryPct,  '#059669',             'Baseline: 20 logs/month')}
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

    const aiPrompt = `${PASTOR_FIRE_VISION}\nMonthly diary summary for Pastor Fire — ${monthName}:\nPrayer: ${prayerHrs.toFixed(1)}hrs (${prayerPct}% of 60hr baseline)${milestone ? ' — MILESTONE ACHIEVED! 🏆' : ''}\nBible Study: ${minsToDisplay(monthAgg.bibleStudyMins)} (${biblePct}%)\nExercise: ${minsToDisplay(monthAgg.exerciseMins)} (${exercisePct}%)\nFasting: ${monthAgg.fastingDays} days (${fastingPct}% of 3-day baseline)\nCoding: ${minsToDisplay(monthAgg.codingMins)} (${codingPct}% of 5hr/week target)\nKeyboard: ${monthAgg.keyboardSessions} session(s) (${keyboardPctM}% of 1/wk target)\nBass Guitar: ${monthAgg.bassSessions} session(s) (${bassPctM}% of 1/wk target)\nDiary consistency: ${monthAgg.diaryDays}/${daysSoFar} days (${diaryPct}%)\nTotal spent: $${monthSpent.toFixed(2)}, Income: $${monthIncome.toFixed(2)}\n\nWrite a powerful 5-6 sentence monthly review. Use the life vision above as the measuring stick — how well did this month advance the mission? Celebrate the prayer milestone if hit. Score technical skill-building (coding/keyboard/bass) — these are Phase 1 of the flying car vision. Be a coach who challenges, not just encourages. End with a declaration for next month.`;

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
        codingMins: 0, codingSessions: 0, baseTrainingSessions: 0, keyboardSessions: 0, bassSessions: 0,
        catMins: { spiritual: 0, skills: 0, health: 0 },
        totalMins: 0, daysLogged: 0, waterMl: 0,
        books: {},        // { title: { pages, audio, count } }
        foodFreq: {},     // { foodName: count }
        monthlyIncome:   new Array(12).fill(0),
        monthlyExpenses: new Array(12).fill(0),
        monthlyPrayer:   new Array(12).fill(0),
        totalIncome: 0, totalExpenses: 0, latestBalance: '',
        // Health
        sickDays: 0, recoveringDays: 0, travelDays: 0, restDays: 0,
        healthyDays: 0,
        monthlySick: new Array(12).fill(0),
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
            if (name.includes('coding') || name.includes('code'))  { agg.codingSessions++; agg.codingMins += mins; }
            if (name.includes('fast') || name.includes('fasting')) agg.fastingDays++;
            if (name.includes('keyboard') || name.includes('piano')) agg.keyboardSessions++;
            if (name.includes('bass'))                               agg.bassSessions++;

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

        // Health
        const h = entry.health || { status: 'healthy', sickDays: 0 };
        if (h.status === 'sick')        { agg.sickDays       += (h.sickDays || 1); agg.monthlySick[monthIdx]++; }
        else if (h.status === 'recovering') { agg.recoveringDays += (h.sickDays || 1); agg.monthlySick[monthIdx]++; }
        else if (h.status === 'travelling') { agg.travelDays++; }
        else if (h.status === 'rest')       { agg.restDays++; }
        else                                { agg.healthyDays++; }
    });

    const netPosition    = agg.totalIncome - agg.totalExpenses;
    const yearRunningBal = computeRunningBalance(entries);

    // Finance mini cards
    if (finCards) finCards.innerHTML = `
        <div class="finance-mini-card expense-card"><span class="fmc-icon">💵</span><div><div class="fmc-label">Income</div><div class="fmc-value">${formatCurrency(agg.totalIncome)}</div></div></div>
        <div class="finance-mini-card balance-card"><span class="fmc-icon">💸</span><div><div class="fmc-label">Spent</div><div class="fmc-value">${formatCurrency(agg.totalExpenses)}</div></div></div>
        <div class="finance-mini-card ${netPosition >= 0 ? 'balance-card' : 'expense-card'}"><span class="fmc-icon">🏦</span><div><div class="fmc-label">Balance</div><div class="fmc-value">${formatCurrency(yearRunningBal)}</div></div></div>
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
        const exHrs  = (agg.exerciseMins / 60);
        const exPct  = baselinePct(agg.exerciseMins, BASELINES.exercise * daysInPeriod);
        const weeksInPeriod = yearlyActiveMonth === 'all' ? 52 : 4;
        const codePct = baselinePct(agg.codingMins,        BASELINES.coding    * weeksInPeriod); // 300mins × weeks
        const kbPct   = baselinePct(agg.keyboardSessions,  BASELINES.keyboard  * weeksInPeriod);
        const bassPct = baselinePct(agg.bassSessions,      BASELINES.bass      * weeksInPeriod);
        const trainPct = baselinePct(agg.baseTrainingSessions, BASELINES.baseTraining * weeksInPeriod);
        html += `<div class="yearly-section">
            <div class="yearly-section-title">💪 Physical Training</div>
            <div class="yearly-stats-row">
                <div class="yearly-big-stat">
                    <div class="ybs-number">${exHrs.toFixed(1)}</div>
                    <div class="ybs-label">Exercise Hours</div>
                    <span class="ybs-badge ${exPct >= 100 ? '' : 'over'}">${exPct}% of target</span>
                </div>
                <div class="yearly-big-stat">
                    <div class="ybs-number">${agg.baseTrainingSessions}</div>
                    <div class="ybs-label">Base Training Sessions</div>
                    <span class="ybs-badge ${trainPct >= 100 ? '' : 'over'}">${trainPct}% of target</span>
                </div>
            </div>
        </div>`;

        html += `<div class="yearly-section">
            <div class="yearly-section-title">💻 Tech & Skills Training</div>
            <div class="yearly-stats-row">
                <div class="yearly-big-stat">
                    <div class="ybs-number">${(agg.codingMins/60).toFixed(1)}</div>
                    <div class="ybs-label">Coding Hours</div>
                    <span class="ybs-badge ${codePct >= 100 ? '' : 'over'}">${codePct}% of 5hrs/wk target</span>
                </div>
                <div class="yearly-big-stat">
                    <div class="ybs-number">${agg.keyboardSessions}</div>
                    <div class="ybs-label">Keyboard Sessions</div>
                    <span class="ybs-badge ${kbPct >= 100 ? '' : 'over'}">${kbPct}% of 1/wk target</span>
                </div>
                <div class="yearly-big-stat">
                    <div class="ybs-number">${agg.bassSessions}</div>
                    <div class="ybs-label">Bass Guitar Sessions</div>
                    <span class="ybs-badge ${bassPct >= 100 ? '' : 'over'}">${bassPct}% of 1/wk target</span>
                </div>
            </div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.5rem;">
                🚀 Phase 1 of Flying Car Vision: Every coding session brings you closer to embedded systems mastery.
            </div>
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

    // ── HEALTH yearly section ─────────────────────────────────────────────────
    if (yearlyActiveFilter === 'all' || yearlyActiveFilter === 'health') {
        const totalUnwell   = agg.sickDays + agg.recoveringDays;
        const sickBadge     = totalUnwell > 0
            ? `<span class="ybs-badge over">${totalUnwell} sick/recovery days</span>` : `<span class="ybs-badge">No sick days 🎉</span>`;
        html += `<div class="yearly-section">
            <div class="yearly-section-title">🩺 Health Overview</div>
            <div class="yearly-stats-row">
                <div class="yearly-big-stat">
                    <div class="ybs-number">${agg.healthyDays}</div>
                    <div class="ybs-label">Healthy Days</div>
                    <span class="ybs-badge exact">${agg.daysLogged} days logged</span>
                </div>
                <div class="yearly-big-stat">
                    <div class="ybs-number">${agg.sickDays}</div>
                    <div class="ybs-label">Sick Day(s)</div>
                    ${agg.sickDays > 0 ? `<span class="ybs-badge over">🤒 logged</span>` : `<span class="ybs-badge">None 🎉</span>`}
                </div>
                <div class="yearly-big-stat">
                    <div class="ybs-number">${agg.recoveringDays}</div>
                    <div class="ybs-label">Recovery Day(s)</div>
                    ${agg.recoveringDays > 0 ? `<span class="ybs-badge over">💊 logged</span>` : `<span class="ybs-badge">None</span>`}
                </div>
                <div class="yearly-big-stat">
                    <div class="ybs-number">${agg.travelDays}</div>
                    <div class="ybs-label">Travel Day(s)</div>
                    ${agg.travelDays > 0 ? `<span class="ybs-badge exact">✈️ trips</span>` : `<span class="ybs-badge">None</span>`}
                </div>
                <div class="yearly-big-stat">
                    <div class="ybs-number">${agg.restDays}</div>
                    <div class="ybs-label">Rest Day(s)</div>
                    ${agg.restDays > 0 ? `<span class="ybs-badge exact">😴 rest</span>` : `<span class="ybs-badge">None</span>`}
                </div>
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
Health: ${agg.healthyDays} healthy days, ${agg.sickDays} sick days, ${agg.recoveringDays} recovery days, ${agg.travelDays} travel days, ${agg.restDays} rest days
Total Income: $${agg.totalIncome.toFixed(2)}, Total Spent: $${agg.totalExpenses.toFixed(2)}, Net: $${netPosition.toFixed(2)}, Running Balance: $${yearRunningBal.toFixed(2)}

Write a powerful 6-8 sentence yearly review. Use the life vision above as the measuring stick for every area. Celebrate spiritual milestones (prayer, fasting, Bible). Score Phase 1 progress: coding sessions, keyboard, bass — these skills directly serve the engineering and media vision. Comment on financial discipline and net position as fuel for the mission. If sick days occurred, note resilience. End with a bold, specific declaration for the coming year — name one area where he must push harder to hit the flying car / kingdom timeline. Tone: prophetic, pastoral, direct, inspiring.`;

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
    let context = `You are AI Coach for Pastor Fire, a pastor in Fiji. You have full access to his diary data AND his life vision below. Your job is not just to encourage — you are a sharp, honest coach who measures every diary entry against the vision and challenges him to execute daily.\n${PASTOR_FIRE_VISION}\n`;
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
                const spent  = (todayEntry.finances.expenses || []).reduce((s,e) => s + (parseFloat(e.amount)||0), 0);
                const income = (todayEntry.finances.income   || []).reduce((s,i) => s + (parseFloat(i.amount)||0), 0);
                context += `, Spent today=$${spent.toFixed(2)}, Income today=$${income.toFixed(2)}`;
            }
            if (todayEntry.health && todayEntry.health.status !== 'healthy') {
                const h = todayEntry.health;
                context += `, Health: ${h.status}${h.sickDays > 0 ? ` (day ${h.sickDays})` : ''}`;
            }
            if (todayEntry.sleep) {
                const s = todayEntry.sleep;
                if (s.wakeTime)  context += `, Woke up: ${formatTime12(s.wakeTime)} (target 4AM${s.wakeReason ? `, reason: ${s.wakeReason}` : ''})`;
                if (s.sleepTime) context += `, Slept: ${formatTime12(s.sleepTime)} (target 10PM${s.sleepReason ? `, reason: ${s.sleepReason}` : ''})`;
            }
            if (todayEntry.review) context += `, Reflection: "${todayEntry.review}"`;
        }

        // Week summary — include health tallies
        let weekPrayer = 0, weekSpent = 0, weekIncome = 0, weekDays = 0;
        let weekSickDays = 0, weekTravelDays = 0, weekRestDays = 0;
        Object.values(weekEntries).forEach(e => {
            if (!e.activities) return;
            weekDays++;
            const agg = aggregateActivities(e.activities);
            weekPrayer += agg.prayerMins;
            if (e.finances) {
                weekSpent  += (e.finances.expenses||[]).reduce((s,ex)=>s+(parseFloat(ex.amount)||0),0);
                weekIncome += (e.finances.income  ||[]).reduce((s,i) =>s+(parseFloat(i.amount) ||0),0);
            }
            if (e.health) {
                if (e.health.status === 'sick' || e.health.status === 'recovering') weekSickDays += (e.health.sickDays || 1);
                if (e.health.status === 'travelling') weekTravelDays++;
                if (e.health.status === 'rest')       weekRestDays++;
            }
        });
        context += `\nThis week: Prayer=${minsToDisplay(weekPrayer)} (target 14hrs), Diary logged=${weekDays}/7 days (target 5), Spent=$${weekSpent.toFixed(2)}, Income=$${weekIncome.toFixed(2)}`;
        if (weekSickDays > 0)   context += `, Sick days this week=${weekSickDays}`;
        if (weekTravelDays > 0) context += `, Travel days=${weekTravelDays}`;
        if (weekRestDays > 0)   context += `, Rest days=${weekRestDays}`;

        // Month summary — include health tallies and running balance
        let monthPrayer = 0, monthSpent = 0, monthIncome = 0, monthDays = 0;
        let monthSickDays = 0, monthTravelDays = 0, monthRestDays = 0;
        Object.values(monthEntries).forEach(e => {
            if (!e.activities) return;
            monthDays++;
            const agg = aggregateActivities(e.activities);
            monthPrayer += agg.prayerMins;
            if (e.finances) {
                monthSpent  += (e.finances.expenses||[]).reduce((s,ex)=>s+(parseFloat(ex.amount)||0),0);
                monthIncome += (e.finances.income  ||[]).reduce((s,i) =>s+(parseFloat(i.amount) ||0),0);
            }
            if (e.health) {
                if (e.health.status === 'sick' || e.health.status === 'recovering') monthSickDays += (e.health.sickDays || 1);
                if (e.health.status === 'travelling') monthTravelDays++;
                if (e.health.status === 'rest')       monthRestDays++;
            }
        });
        const runBal = computeRunningBalance(monthEntries);
        context += `\nThis month: Prayer=${(monthPrayer/60).toFixed(1)}hrs (target 60hrs), Diary logged=${monthDays} days (target 20), Total spent=$${monthSpent.toFixed(2)}, Total income=$${monthIncome.toFixed(2)}, Running balance=$${runBal.toFixed(2)}`;
        if (monthSickDays > 0)   context += `, Sick days this month=${monthSickDays}`;
        if (monthTravelDays > 0) context += `, Travel days=${monthTravelDays}`;
        if (monthRestDays > 0)   context += `, Rest days=${monthRestDays}`;
    } catch (e) {
        context += '\n(Data unavailable right now)';
    }

    // Chat history for context
    const history = storage.getChatHistory().slice(-10);
    const historyText = history.map(m => `${m.role === 'user' ? 'Pastor Fire' : 'AI Coach'}: ${m.content}`).join('\n');

    const fullPrompt = `${context}\n\nConversation so far:\n${historyText}\n\nPastor Fire: ${message}\n\nAI Coach (respond as a sharp, honest pastoral coach who always connects the answer back to the life vision. Be warm but direct. Challenge him when needed. 2-4 sentences max unless detail is needed. If asking about sick days, travel, health — pull from diary health data):`;

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
function initApp() {
    storage.init();
    loadDailyScripture();
    setupDropzone();
    document.getElementById('entry-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('entry-date').addEventListener('change', loadEntryForDate);
    addActivityField();
    addExpenseRow();
    addIncomeRow();
    // Show write tab by default
    showTab('write');
    // Load running balance on startup
    loadRunningBalance();
    // Header rotating quotes
    initHeaderQuotes();
}

window.addEventListener('DOMContentLoaded', () => {
    // If already authenticated this session, skip login screen
    if (checkSession()) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-root').style.display     = 'block';
        initApp();
    }
    // Otherwise login screen stays visible, initApp() called by attemptLogin()
});

// ─── Header Rotating Quotes ───────────────────────────────────────────────────
function initHeaderQuotes() {
    const techQuotes = [
        { text: "Technology is best when it brings people together.", author: "Matt Mullenweg" },
        { text: "The science of today is the technology of tomorrow.", author: "Edward Teller" },
        { text: "Innovation distinguishes a leader from a follower.", author: "Steve Jobs" },
        { text: "Code is like prayer — it requires discipline and consistency.", author: "" },
        { text: "The greatest danger is not that our aim is too high, but too low.", author: "Michelangelo" },
        { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
        { text: "Build systems that outlast your season.", author: "" },
        { text: "Every expert was once a beginner. Keep building.", author: "" },
        { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
        { text: "Small consistent actions create extraordinary results.", author: "" },
    ];

    const scriptureQuotes = [
        { text: "I can do all things through Christ who strengthens me.", ref: "Phil 4:13 NKJV" },
        { text: "For I know the thoughts that I think toward you, says the Lord, thoughts of peace and not of evil, to give you a future and a hope.", ref: "Jer 29:11 NKJV" },
        { text: "Trust in the Lord with all your heart, and lean not on your own understanding.", ref: "Prov 3:5 NKJV" },
        { text: "Be strong and of good courage; do not be afraid, nor be dismayed, for the Lord your God is with you wherever you go.", ref: "Josh 1:9 NKJV" },
        { text: "Commit your works to the Lord, and your thoughts will be established.", ref: "Prov 16:3 NKJV" },
        { text: "The Lord is my strength and my shield; my heart trusted in Him, and I am helped.", ref: "Ps 28:7 NKJV" },
        { text: "But seek first the kingdom of God and His righteousness, and all these things shall be added to you.", ref: "Matt 6:33 NKJV" },
        { text: "The name of the Lord is a strong tower; the righteous run to it and are safe.", ref: "Prov 18:10 NKJV" },
        { text: "With God all things are possible.", ref: "Matt 19:26 NKJV" },
        { text: "But those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles.", ref: "Isa 40:31 NKJV" },
    ];

    // Pick one per day (day-of-year index so it changes daily but is stable)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const tq = techQuotes[dayOfYear % techQuotes.length];
    const sq = scriptureQuotes[dayOfYear % scriptureQuotes.length];

    const techEl = document.getElementById('header-tech-quote');
    const scrEl  = document.getElementById('header-scripture-quote');

    if (techEl) {
        techEl.innerHTML = `<span class="hq-text">"${tq.text}"</span>${tq.author ? `<span class="hq-author">— ${tq.author}</span>` : ''}`;
    }
    if (scrEl) {
        scrEl.innerHTML = `<span class="hq-text">"${sq.text}"</span><span class="hq-author">— ${sq.ref}</span>`;
    }
}
