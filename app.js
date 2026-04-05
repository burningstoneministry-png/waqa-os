// app.js - Main application logic (Supabase-powered)

let activityCount    = 0;
let currentTab       = 'daily';
let extractedOcrData = null;

// ─── Duration Parser ─────────────────────────────────────────────────────────
// Converts duration strings like "30mins", "1hr", "1hr 30mins", "2hrs 30mins"
// into total minutes (integer).
function parseDurationToMins(str) {
    if (!str || typeof str !== 'string') return 0;
    const s = str.trim().toLowerCase();
    let mins = 0;
    // Match hours part  e.g. "2hr", "2hrs"
    const hrMatch = s.match(/(\d+)\s*hrs?/);
    if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
    // Match minutes part  e.g. "30mins", "30min"
    const minMatch = s.match(/(\d+)\s*mins?/);
    if (minMatch) mins += parseInt(minMatch[1], 10);
    return mins;
}

// Convert minutes back to a human-readable string: "1hr 30mins", "45mins", etc.
function minsToDisplay(totalMins) {
    if (!totalMins || totalMins <= 0) return '—';
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h === 0) return `${m}mins`;
    if (m === 0) return h === 1 ? `1hr` : `${h}hrs`;
    return h === 1 ? `1hr ${m}mins` : `${h}hrs ${m}mins`;
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
    { text: "In the beginning God created the heavens and the earth. The earth was without form, and void; and the Spirit of God was hovering over the face of the waters.", ref: "Genesis 1:1–2 (NKJV)" },
    { text: "The LORD your God will bless you in all your produce and in all the work of your hands, so that you surely rejoice.", ref: "Deuteronomy 16:15 (NKJV)" },
    { text: "And whatever you do, do it heartily, as to the Lord and not to men.", ref: "Colossians 3:23 (NKJV)" },
    { text: "Without counsel, plans go awry, but in the multitude of counselors they are established.", ref: "Proverbs 15:22 (NKJV)" },
    { text: "The heavens declare the glory of God; and the firmament shows His handiwork.", ref: "Psalm 19:1 (NKJV)" },
    { text: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.", ref: "John 3:16 (NKJV)" },
    { text: "Jesus said to him, 'I am the way, the truth, and the life. No one comes to the Father except through Me.'", ref: "John 14:6 (NKJV)" },
    { text: "So Jesus said to them, 'Because of your unbelief; for assuredly, I say to you, if you have faith as a mustard seed, you will say to this mountain, Move from here to there, and it will move; and nothing will be impossible for you.'", ref: "Matthew 17:20 (NKJV)" },
    { text: "The effective, fervent prayer of a righteous man avails much.", ref: "James 5:16 (NKJV)" },
    { text: "And God is able to make all grace abound toward you, that you, always having all sufficiency in all things, may have an abundance for every good work.", ref: "2 Corinthians 9:8 (NKJV)" },
    { text: "But seek first the kingdom of God and His righteousness, and all these things shall be added to you.", ref: "Matthew 6:33 (NKJV)" },
    { text: "But Jesus looked at them and said, 'With men it is impossible, but not with God; for with God all things are possible.'", ref: "Mark 10:27 (NKJV)" },
    { text: "The thief does not come except to steal, and to kill, and to destroy. I have come that they may have life, and that they may have it more abundantly.", ref: "John 10:10 (NKJV)" },
    { text: "Delight yourself also in the LORD, and He shall give you the desires of your heart.", ref: "Psalm 37:4 (NKJV)" },
    { text: "The LORD is my shepherd; I shall not want.", ref: "Psalm 23:1 (NKJV)" },
    { text: "Being confident of this very thing, that He who has begun a good work in you will complete it until the day of Jesus Christ.", ref: "Philippians 1:6 (NKJV)" },
    { text: "Now faith is the substance of things hoped for, the evidence of things not seen.", ref: "Hebrews 11:1 (NKJV)" },
    { text: "What then shall we say to these things? If God is for us, who can be against us?", ref: "Romans 8:31 (NKJV)" },
    { text: "The plans of the diligent lead surely to plenty, but those of everyone who is hasty, surely to poverty.", ref: "Proverbs 21:5 (NKJV)" },
    { text: "Let your light so shine before men, that they may see your good works and glorify your Father in heaven.", ref: "Matthew 5:16 (NKJV)" },
    { text: "For we are His workmanship, created in Christ Jesus for good works, which God prepared beforehand that we should walk in them.", ref: "Ephesians 2:10 (NKJV)" },
    { text: "The LORD will open to you His good treasure, the heavens, to give the rain to your land in its season, and to bless all the work of your hand.", ref: "Deuteronomy 28:12 (NKJV)" },
    { text: "Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God.", ref: "Philippians 4:6 (NKJV)" },
    { text: "I will lift up my eyes to the hills — from whence comes my help? My help comes from the LORD, who made heaven and earth.", ref: "Psalm 121:1–2 (NKJV)" },
    { text: "All things were made through Him, and without Him nothing was made that was made.", ref: "John 1:3 (NKJV)" },
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

function generateStars() {
    ['stars', 'stars2'].forEach((id, ci) => {
        const c = document.getElementById(id);
        if (!c) return;
        const count = ci === 0 ? 60 : 30;
        let html = '';
        for (let i = 0; i < count; i++) {
            const x    = Math.random() * 100;
            const y    = Math.random() * 100;
            const size = Math.random() * 1.5 + 0.5;
            const delay = Math.random() * 5;
            const dur   = Math.random() * 3 + 2;
            html += `<span style="position:absolute;left:${x}%;top:${y}%;width:${size}px;height:${size}px;background:white;border-radius:50%;opacity:${(Math.random()*0.6+0.2).toFixed(2)};animation:twinkle ${dur.toFixed(1)}s ${delay.toFixed(1)}s ease-in-out infinite alternate;"></span>`;
        }
        c.innerHTML = html;
    });
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
    // Find the row this dropdown belongs to
    const dropdown = el.closest('.preset-dropdown');
    const row      = dropdown.closest('.activity-row');
    if (!row) return;
    const textInput = row.querySelector('.act-text');
    const catSelect = row.querySelector('.act-category');
    textInput.value     = name;
    catSelect.value     = category;
    const id = row.id.replace('activity-', '');
    updateCategoryColor(id, category);
    dropdown.classList.remove('open');
}

function togglePresetDropdown(btn) {
    const row      = btn.closest('.activity-row');
    const dropdown = row.querySelector('.preset-dropdown');
    // Refresh contents
    dropdown.querySelector('.preset-list').innerHTML = buildPresetOptions();
    // Close all others
    document.querySelectorAll('.preset-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
    });
    dropdown.classList.toggle('open');
}

// Close preset dropdowns on outside click
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
    // Detect category from the activity row's current selection
    const actRow = btn.closest('.activity-row');
    const cat    = actRow ? actRow.querySelector('.act-category').value : 'general';
    const added  = storage.addPreset(name, cat);
    if (added) {
        showToast(`"${name}" saved to presets ✅`, 'success');
        input.value = '';
        // Refresh the list
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
            el.querySelector('.act-time').value      = '';
            el.querySelector('.act-text').value      = '';
            el.querySelector('.act-duration').value  = '';
            el.querySelector('.act-category').value  = 'general';
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
    const text = row.querySelector('.act-text').value;
    // Also try to match a preset category automatically
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
    // Clear the form but keep today's date selected and one blank row
    document.getElementById('activities-container').innerHTML = '';
    document.getElementById('daily-review').value = '';
    activityCount = 0;
    addActivityField();
    // Reset date to today
    document.getElementById('entry-date').value = new Date().toISOString().slice(0, 10);
}

// ─── Load existing entry for a date (for reference only — not loaded into form)
// The form is always FRESH. Existing entries ACCUMULATE via saveEntry append logic.
// We only load when user explicitly switches to a date that already has data —
// shown as a subtle info banner so they know data exists.
async function loadEntryForDate() {
    const date = document.getElementById('entry-date').value;
    if (!date) return;

    // Clear the form — start fresh for the selected date
    document.getElementById('activities-container').innerHTML = '';
    document.getElementById('daily-review').value = '';
    activityCount = 0;
    addActivityField(); // one blank row ready

    const entry = await storage.getEntry(date);
    if (entry && entry.activities && entry.activities.length > 0) {
        const totalMins = entry.activities.reduce((s, a) => s + parseDurationToMins(a.duration), 0);
        const summary   = minsToDisplay(totalMins);
        showToast(`${entry.activities.length} activities already saved for ${date} (${summary} total). New activities will be added to them.`, 'info');
        // Show the existing activities count as a header above the form
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

// Optional: let user load existing entries into form for editing
async function loadExistingIntoForm(date) {
    const entry = await storage.getEntry(date);
    if (!entry || !entry.activities) return;
    document.getElementById('activities-container').innerHTML = '';
    activityCount = 0;
    entry.activities.forEach(a => addActivityField(a));
    addActivityField(); // blank row for new
    document.getElementById('daily-review').value = entry.review || '';
    showToast('Loaded all activities for editing. Saving will replace the full list for this date.', 'info');

    // When editing the full list, we need to REPLACE not append.
    // Flag this mode so saveEntry knows to replace.
    window._editingFullList = date;

    const banner = document.getElementById('existing-banner');
    if (banner) banner.innerHTML = `<span>✏️ Editing full list for ${date}. Saving will <strong>replace</strong> the entire day's activities.</span>`;
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

    // Duration totals by category
    const catMins  = { spiritual: 0, skills: 0, health: 0, general: 0 };
    const catCount = { spiritual: 0, skills: 0, health: 0, general: 0 };
    let   totalMins = 0;

    entry.activities.forEach(a => {
        const m = parseDurationToMins(a.duration);
        catMins[a.category]  = (catMins[a.category]  || 0) + m;
        catCount[a.category] = (catCount[a.category] || 0) + 1;
        totalMins += m;
    });

    const total = entry.activities.length;
    const score = Math.round(((catCount.spiritual + catCount.skills + catCount.health) / total) * 100);

    container.innerHTML = `
        <div class="summary-score">
            <div class="score-circle" style="--score:${score}">${score}<span>%</span></div>
            <p>Today's Performance Score</p>
        </div>
        <div class="duration-totals">
            ${renderDurationTotal('🟠 Spiritual', catMins.spiritual, totalMins, 'spiritual')}
            ${renderDurationTotal('🟢 Skills',    catMins.skills,    totalMins, 'skills')}
            ${renderDurationTotal('🔵 Health',    catMins.health,    totalMins, 'health')}
            ${catMins.general > 0 ? renderDurationTotal('⚪ General', catMins.general, totalMins, 'general') : ''}
            <div class="duration-total-row total-row">
                <span class="dur-label">Total Time</span>
                <span class="dur-value">${minsToDisplay(totalMins)}</span>
            </div>
        </div>
        <div class="activities-list">
            <h3>Today's Activities</h3>
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
    `;
}

function renderDurationTotal(label, mins, totalMins, cat) {
    const pct = totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0;
    return `
        <div class="duration-total-row">
            <span class="dur-label cat-${cat}">${label}</span>
            <div class="dur-bar-track"><div class="dur-bar-fill cat-fill-${cat}" style="width:${pct}%"></div></div>
            <span class="dur-value">${minsToDisplay(mins)}</span>
            <span class="dur-pct">${pct}%</span>
        </div>
    `;
}

function renderCategoryBar(label, count, total, cat) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
        <div class="cat-bar-row">
            <span class="cat-label cat-${cat}">${label}</span>
            <div class="cat-bar-track"><div class="cat-bar-fill cat-fill-${cat}" style="width:${pct}%"></div></div>
            <span class="cat-count">${count} (${pct}%)</span>
        </div>
    `;
}

// ─── Weekly View ──────────────────────────────────────────────────────────────
async function renderWeeklyView() {
    const container = document.getElementById('weekly-content');
    container.innerHTML = '<div class="empty-state"><span>⏳</span><p>Loading from Supabase…</p></div>';

    const entries   = await storage.getWeekEntries();
    const days      = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }

    const dayNames   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const totalMins  = { spiritual: 0, skills: 0, health: 0, general: 0 };
    const totalCount = { spiritual: 0, skills: 0, health: 0, general: 0 };
    let   grandMins  = 0;
    let gridHtml     = '<div class="week-grid">';

    days.forEach(day => {
        const entry   = entries[day];
        const d       = new Date(day + 'T00:00:00');
        const isToday = day === new Date().toISOString().slice(0, 10);
        const hasEntry= entry && entry.activities && entry.activities.length > 0;
        const dayMins = { spiritual: 0, skills: 0, health: 0 };

        if (hasEntry) {
            entry.activities.forEach(a => {
                const m = parseDurationToMins(a.duration);
                if (dayMins[a.category]   !== undefined) dayMins[a.category]   += m;
                if (totalMins[a.category] !== undefined) totalMins[a.category] += m;
                if (totalCount[a.category]!== undefined) totalCount[a.category]++;
                grandMins += m;
            });
        }

        const dayTotalMins = dayMins.spiritual + dayMins.skills + dayMins.health;
        gridHtml += `
            <div class="week-day ${isToday ? 'today' : ''} ${hasEntry ? 'has-entry' : 'no-entry'}">
                <div class="day-label">${dayNames[d.getDay()]}</div>
                <div class="day-date">${d.getDate()}</div>
                <div class="day-dots">
                    ${dayMins.spiritual > 0 ? `<span class="dot dot-spiritual" title="Spiritual: ${minsToDisplay(dayMins.spiritual)}"></span>` : ''}
                    ${dayMins.skills    > 0 ? `<span class="dot dot-skills"    title="Skills: ${minsToDisplay(dayMins.skills)}"></span>`       : ''}
                    ${dayMins.health    > 0 ? `<span class="dot dot-health"    title="Health: ${minsToDisplay(dayMins.health)}"></span>`       : ''}
                </div>
                <div class="day-count">${hasEntry ? minsToDisplay(dayTotalMins) : '—'}</div>
            </div>
        `;
    });
    gridHtml += '</div>';

    const totalActs  = Object.values(totalCount).reduce((s, v) => s + v, 0);
    const weekScore  = totalActs > 0 ? Math.round(((totalCount.spiritual + totalCount.skills + totalCount.health) / totalActs) * 100) : 0;
    const daysLogged = days.filter(d => entries[d] && entries[d].activities && entries[d].activities.length > 0).length;

    container.innerHTML = `
        <div class="week-stats">
            <div class="stat-card"><div class="stat-num">${daysLogged}/7</div><div class="stat-label">Days Logged</div></div>
            <div class="stat-card"><div class="stat-num">${totalActs}</div><div class="stat-label">Total Activities</div></div>
            <div class="stat-card"><div class="stat-num">${minsToDisplay(grandMins)}</div><div class="stat-label">Total Hours</div></div>
            <div class="stat-card"><div class="stat-num">${weekScore}%</div><div class="stat-label">Week Score</div></div>
        </div>
        ${gridHtml}
        <h3 style="margin:1.5rem 0 0.75rem; font-size:1rem; color:var(--text-muted);">Time by Category This Week</h3>
        <div class="duration-totals">
            ${renderDurationTotal('🟠 Spiritual', totalMins.spiritual, grandMins, 'spiritual')}
            ${renderDurationTotal('🟢 Skills',    totalMins.skills,    grandMins, 'skills')}
            ${renderDurationTotal('🔵 Health',    totalMins.health,    grandMins, 'health')}
            ${totalMins.general > 0 ? renderDurationTotal('⚪ General', totalMins.general, grandMins, 'general') : ''}
            <div class="duration-total-row total-row">
                <span class="dur-label">Total Time</span>
                <span class="dur-value">${minsToDisplay(grandMins)}</span>
            </div>
        </div>
    `;
}

// ─── Monthly Review ───────────────────────────────────────────────────────────
async function renderMonthlyReview() {
    const container = document.getElementById('monthly-content');
    container.innerHTML = '<div class="empty-state"><span>⏳</span><p>Loading from Supabase…</p></div>';

    const entries    = await storage.getMonthEntries();
    const today      = new Date();
    const daysSoFar  = today.getDate();
    const totalMins  = { spiritual: 0, skills: 0, health: 0, general: 0 };
    const totalCount = { spiritual: 0, skills: 0, health: 0, general: 0 };
    let   grandMins  = 0;
    let   daysLogged = 0;

    Object.values(entries).forEach(entry => {
        if (entry.activities && entry.activities.length > 0) {
            daysLogged++;
            entry.activities.forEach(a => {
                const m = parseDurationToMins(a.duration);
                if (totalMins[a.category]  !== undefined) totalMins[a.category]  += m;
                if (totalCount[a.category] !== undefined) totalCount[a.category]++;
                grandMins += m;
            });
        }
    });

    const consistency = Math.round((daysLogged / daysSoFar) * 100);
    const totalActs   = Object.values(totalCount).reduce((s, v) => s + v, 0);
    const monthScore  = totalActs > 0 ? Math.round(((totalCount.spiritual + totalCount.skills + totalCount.health) / totalActs) * 100) : 0;
    const insights    = generateInsights(totalCount, daysLogged, daysSoFar, consistency);

    container.innerHTML = `
        <div class="month-header">
            <h3>${today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        </div>
        <div class="week-stats">
            <div class="stat-card"><div class="stat-num">${consistency}%</div><div class="stat-label">Consistency</div></div>
            <div class="stat-card"><div class="stat-num">${daysLogged}/${daysSoFar}</div><div class="stat-label">Days Logged</div></div>
            <div class="stat-card"><div class="stat-num">${minsToDisplay(grandMins)}</div><div class="stat-label">Total Hours</div></div>
            <div class="stat-card"><div class="stat-num">${monthScore}%</div><div class="stat-label">Month Score</div></div>
        </div>
        <h3 style="margin:1.5rem 0 0.75rem; font-size:1rem; color:var(--text-muted);">Time by Category This Month</h3>
        <div class="duration-totals">
            ${renderDurationTotal('🟠 Spiritual', totalMins.spiritual, grandMins, 'spiritual')}
            ${renderDurationTotal('🟢 Skills',    totalMins.skills,    grandMins, 'skills')}
            ${renderDurationTotal('🔵 Health',    totalMins.health,    grandMins, 'health')}
            ${totalMins.general > 0 ? renderDurationTotal('⚪ General', totalMins.general, grandMins, 'general') : ''}
            <div class="duration-total-row total-row">
                <span class="dur-label">Total Time</span>
                <span class="dur-value">${minsToDisplay(grandMins)}</span>
            </div>
        </div>
        <div class="insights-box">
            <h3>💡 Insights</h3>
            ${insights.map(i => `<div class="insight-item">${i}</div>`).join('')}
        </div>
    `;
}

function generateInsights(cats, daysLogged, daysSoFar, consistency) {
    const insights = [];
    const total    = cats.spiritual + cats.skills + cats.health + cats.general;

    if      (consistency >= 80) insights.push('🌟 Excellent consistency! You\'ve logged ' + daysLogged + ' out of ' + daysSoFar + ' days this month.');
    else if (consistency >= 50) insights.push('👍 Good effort! Try to log every day for better tracking.');
    else                        insights.push('📝 Start building your daily journaling habit — even 5 minutes counts!');

    if (total === 0) { insights.push('📭 No activities logged yet this month. Start writing today!'); return insights; }

    const spiritualPct = Math.round((cats.spiritual / total) * 100);
    const skillsPct    = Math.round((cats.skills    / total) * 100);
    const healthPct    = Math.round((cats.health    / total) * 100);

    if (spiritualPct === 0) insights.push('🙏 No spiritual activities logged. Consider adding prayer or devotion to your routine.');
    else if (spiritualPct >= 30) insights.push(`🙏 Strong spiritual focus at ${spiritualPct}% — keep nurturing your faith!`);

    if (skillsPct === 0) insights.push('📚 No skill-building logged. Try adding reading or learning sessions.');
    else if (skillsPct >= 30) insights.push(`📚 Great skill development at ${skillsPct}% — you\'re investing in your growth!`);

    if (healthPct === 0) insights.push('💪 No health activities logged. Consider adding exercise or tracking water intake.');
    else if (healthPct >= 30) insights.push(`💪 Solid health focus at ${healthPct}% — your body will thank you!`);

    const dominant = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
    if (dominant[1] > 0) insights.push(`⭐ Your strongest category this month is <strong>${dominant[0]}</strong> with ${dominant[1]} activities.`);

    return insights;
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

    const onStatus = (msg) => {
        const el = document.getElementById('ocr-status');
        if (el) el.textContent = msg;
        const bar = document.getElementById('ocr-progress-bar');
        if (bar) bar.style.width = '70%';
    };

    const onProgress = (p) => {
        const bar = document.getElementById('ocr-progress-bar');
        const el  = document.getElementById('ocr-status');
        if (bar) bar.style.width = (p.progress * 100) + '%';
        if (el)  el.textContent  = p.status || 'Processing…';
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

        doc.setFillColor(13, 27, 75);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(245, 200, 66);
        doc.setFontSize(30); doc.setFont('helvetica', 'bold');
        doc.text('Diary Tracker', 105, 110, { align: 'center' });
        doc.setFontSize(13); doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 220, 255);
        doc.text('Personal Journal Export', 105, 124, { align: 'center' });
        doc.text('Exported: ' + new Date().toLocaleDateString(), 105, 136, { align: 'center' });
        doc.text(dates.length + ' entries', 105, 146, { align: 'center' });

        const catColors = {
            spiritual: [216, 90, 48],
            skills:    [99, 153, 34],
            health:    [55, 138, 221],
            general:   [130, 130, 130]
        };

        for (const date of dates) {
            const entry = entries[date];
            if (!entry || !entry.activities || entry.activities.length === 0) continue;
            doc.addPage();
            let y = 20;

            doc.setFillColor(13, 27, 75);
            doc.rect(0, 0, 210, 16, 'F');
            doc.setTextColor(245, 200, 66);
            doc.setFontSize(13); doc.setFont('helvetica', 'bold');
            const d = new Date(date + 'T00:00:00');
            doc.text(d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 10, 11);
            y = 26;

            doc.setTextColor(30, 30, 30);
            doc.setFontSize(10); doc.setFont('helvetica', 'bold');
            doc.text('Activities', 10, y); y += 7;

            for (const act of entry.activities) {
                if (y > 272) { doc.addPage(); y = 20; }
                const col = catColors[act.category] || catColors.general;
                doc.setFillColor(...col);
                doc.roundedRect(10, y - 4.5, 3, 6, 1, 1, 'F');
                doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
                doc.setTextColor(30, 30, 30);
                const line = `${act.time || '—'}   ${act.activity}${act.duration ? '  (' + act.duration + ')' : ''}`;
                doc.text(line, 16, y); y += 8;
            }

            // Duration totals
            const catM = { spiritual: 0, skills: 0, health: 0, general: 0 };
            entry.activities.forEach(a => {
                if (catM[a.category] !== undefined) catM[a.category] += parseDurationToMins(a.duration);
            });
            const grandM = Object.values(catM).reduce((s, v) => s + v, 0);
            if (grandM > 0) {
                y += 4;
                if (y > 272) { doc.addPage(); y = 20; }
                doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(60, 60, 80);
                doc.text(`Total: ${minsToDisplay(grandM)}  |  Spiritual: ${minsToDisplay(catM.spiritual)}  |  Skills: ${minsToDisplay(catM.skills)}  |  Health: ${minsToDisplay(catM.health)}`, 10, y);
                y += 8;
            }

            if (entry.review) {
                y += 4;
                if (y > 262) { doc.addPage(); y = 20; }
                const lines = doc.splitTextToSize(entry.review, 180);
                doc.setFillColor(255, 251, 235);
                doc.roundedRect(10, y - 5, 190, 10 + lines.length * 6, 2, 2, 'F');
                doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(100, 80, 0);
                doc.text('Reflection', 14, y); y += 6;
                doc.setFont('helvetica', 'italic'); doc.setTextColor(60, 60, 60);
                doc.text(lines, 14, y);
            }
        }

        doc.save('diary-tracker-' + new Date().toISOString().slice(0, 10) + '.pdf');
        showToast('PDF exported! ✅', 'success');
    } catch (e) {
        console.error(e);
        showToast('PDF failed: ' + e.message, 'error');
    }
}

// ─── Export as PNG / JPEG ─────────────────────────────────────────────────────
async function exportAsImage(fmt) {
    document.getElementById('export-dropdown').classList.remove('open');
    showToast('Capturing ' + fmt.toUpperCase() + '…', 'info');
    try {
        const el     = document.querySelector('main');
        const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#F7F8FA' });
        const mime   = fmt === 'jpeg' ? 'image/jpeg' : 'image/png';
        const url    = canvas.toDataURL(mime, 0.95);
        const a      = document.createElement('a');
        a.href       = url;
        a.download   = 'diary-tracker-' + new Date().toISOString().slice(0, 10) + '.' + fmt;
        a.click();
        showToast(fmt.toUpperCase() + ' exported! ✅', 'success');
    } catch (e) {
        console.error(e);
        showToast('Image export failed: ' + e.message, 'error');
    }
}

// ─── Import dispatcher ────────────────────────────────────────────────────────
function importAs(type) {
    document.getElementById('import-dropdown').classList.remove('open');
    if (type === 'pdf')   document.getElementById('import-pdf-file').click();
    if (type === 'image') document.getElementById('import-image-file').click();
}

// ─── Import PDF → render page → OCR ──────────────────────────────────────────
async function handlePdfImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    showToast('Loading PDF…', 'info');
    try {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const buf      = await file.arrayBuffer();
        const pdf      = await pdfjsLib.getDocument({ data: buf }).promise;
        const page     = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas   = document.createElement('canvas');
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        showToast('PDF rendered — running OCR…', 'info');
        showTab('photo');
        const preview = document.getElementById('photo-preview');
        preview.src   = canvas.toDataURL('image/png');
        preview.style.display = 'block';
        document.getElementById('ocr-progress').style.display = 'block';
        document.getElementById('ocr-result').style.display   = 'none';
        document.getElementById('import-btn').style.display   = 'none';

        canvas.toBlob(async blob => {
            try {
                const result = await ocr.processImage(blob);
                extractedOcrData = result;
                displayOcrResult(result);
                showToast('PDF OCR done! Review & import. ✅', 'success');
            } catch (err) {
                showToast('OCR failed: ' + err.message, 'error');
                document.getElementById('ocr-progress').style.display = 'none';
            }
        }, 'image/png');
    } catch (e) {
        console.error(e);
        showToast('PDF load failed: ' + e.message, 'error');
    }
}

// ─── Import JPEG / PNG → OCR ──────────────────────────────────────────────────
function handleImageImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    showTab('photo');
    processOcrFile(file);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const toast    = document.getElementById('toast');
    toast.textContent = message;
    toast.className   = 'toast toast-' + type + ' show';
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    storage.init();

    // Set today's date, but do NOT load existing entry (form starts fresh)
    const dateInput = document.getElementById('entry-date');
    dateInput.value = new Date().toISOString().slice(0, 10);

    // When user changes date, show info about existing data but keep form fresh
    dateInput.addEventListener('change', loadEntryForDate);

    addActivityField(); // one blank row ready
    setupDropzone();
    loadDailyScripture();
    generateStars();
    showTab('write');   // Start on Write tab so form is ready
});
