// app.js - Main application logic (Supabase-powered)

let activityCount   = 0;
let currentTab      = 'daily';
let extractedOcrData = null;

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
    { text: "Delight yourself also in the LORD, and He shall give you the desires of your heart.", ref: "Psalm 37:4 (NKJV)" },
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
        <input type="text" class="act-text" value="${prefill.activity || ''}" placeholder="Activity description..." oninput="autoCategorize(${id})">
        <input type="text" class="act-duration" value="${prefill.duration || ''}" placeholder="Duration (e.g. 1hr)">
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

function removeActivity(id) {
    const rows = document.querySelectorAll('.activity-row');
    if (rows.length <= 1) {
        // Don't remove the last row — just clear it instead
        const el = document.getElementById('activity-' + id);
        if (el) {
            el.querySelector('.act-time').value = '';
            el.querySelector('.act-text').value = '';
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
    const text = row.querySelector('.act-text').value;
    const cat  = ocr.categorizeActivity(text);
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

    const rows = document.querySelectorAll('.activity-row');
    const activities = [];
    rows.forEach(row => {
        const text = row.querySelector('.act-text').value.trim();
        if (!text) return;
        activities.push({
            time:     row.querySelector('.act-time').value,
            activity: text,
            duration: row.querySelector('.act-duration').value,
            category: row.querySelector('.act-category').value
        });
    });

    if (activities.length === 0) { showToast('Add at least one activity', 'error'); return; }

    showToast('Saving…', 'info');
    const entry = { date, activities, review: document.getElementById('daily-review').value };
    const saved = await storage.saveEntry(date, entry);
    if (saved) {
        showToast('Entry saved to Supabase ✅', 'success');
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
}

// ─── Load existing entry ──────────────────────────────────────────────────────
async function loadEntryForDate() {
    const date = document.getElementById('entry-date').value;
    if (!date) return;
    const entry = await storage.getEntry(date);
    if (entry) {
        document.getElementById('activities-container').innerHTML = '';
        activityCount = 0;
        entry.activities.forEach(a => addActivityField(a));
        addActivityField(); // blank row for adding more
        document.getElementById('daily-review').value = entry.review || '';
        showToast('Entry loaded for ' + date, 'info');
    }
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

    const cats  = { spiritual: 0, skills: 0, health: 0, general: 0 };
    entry.activities.forEach(a => cats[a.category] = (cats[a.category] || 0) + 1);
    const total = entry.activities.length;
    const score = Math.round(((cats.spiritual + cats.skills + cats.health) / total) * 100);

    container.innerHTML = `
        <div class="summary-score">
            <div class="score-circle" style="--score:${score}">${score}<span>%</span></div>
            <p>Today's Performance Score</p>
        </div>
        <div class="category-bars">
            ${renderCategoryBar('Spiritual', cats.spiritual, total, 'spiritual')}
            ${renderCategoryBar('Skills',    cats.skills,    total, 'skills')}
            ${renderCategoryBar('Health',    cats.health,    total, 'health')}
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

    const dayNames  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let totalCats   = { spiritual: 0, skills: 0, health: 0, general: 0 };
    let gridHtml    = '<div class="week-grid">';

    days.forEach(day => {
        const entry   = entries[day];
        const d       = new Date(day + 'T00:00:00');
        const isToday = day === new Date().toISOString().slice(0, 10);
        const hasEntry= entry && entry.activities && entry.activities.length > 0;
        let cats      = { spiritual: 0, skills: 0, health: 0 };

        if (hasEntry) {
            entry.activities.forEach(a => {
                if (cats[a.category]      !== undefined) cats[a.category]++;
                if (totalCats[a.category] !== undefined) totalCats[a.category]++;
            });
        }

        gridHtml += `
            <div class="week-day ${isToday ? 'today' : ''} ${hasEntry ? 'has-entry' : 'no-entry'}">
                <div class="day-label">${dayNames[d.getDay()]}</div>
                <div class="day-date">${d.getDate()}</div>
                <div class="day-dots">
                    ${cats.spiritual > 0 ? `<span class="dot dot-spiritual" title="Spiritual: ${cats.spiritual}"></span>` : ''}
                    ${cats.skills    > 0 ? `<span class="dot dot-skills"    title="Skills: ${cats.skills}"></span>`       : ''}
                    ${cats.health    > 0 ? `<span class="dot dot-health"    title="Health: ${cats.health}"></span>`       : ''}
                </div>
                <div class="day-count">${hasEntry ? entry.activities.length + ' act.' : '—'}</div>
            </div>
        `;
    });
    gridHtml += '</div>';

    const totalActs   = Object.values(totalCats).reduce((s, v) => s + v, 0);
    const weekScore   = totalActs > 0 ? Math.round(((totalCats.spiritual + totalCats.skills + totalCats.health) / totalActs) * 100) : 0;
    const daysLogged  = days.filter(d => entries[d] && entries[d].activities && entries[d].activities.length > 0).length;

    container.innerHTML = `
        <div class="week-stats">
            <div class="stat-card"><div class="stat-num">${daysLogged}/7</div><div class="stat-label">Days Logged</div></div>
            <div class="stat-card"><div class="stat-num">${totalActs}</div><div class="stat-label">Total Activities</div></div>
            <div class="stat-card"><div class="stat-num">${weekScore}%</div><div class="stat-label">Week Score</div></div>
        </div>
        ${gridHtml}
        <div class="category-bars" style="margin-top:1.5rem">
            ${renderCategoryBar('Spiritual', totalCats.spiritual, totalActs, 'spiritual')}
            ${renderCategoryBar('Skills',    totalCats.skills,    totalActs, 'skills')}
            ${renderCategoryBar('Health',    totalCats.health,    totalActs, 'health')}
        </div>
    `;
}

// ─── Monthly Review ───────────────────────────────────────────────────────────
async function renderMonthlyReview() {
    const container = document.getElementById('monthly-content');
    container.innerHTML = '<div class="empty-state"><span>⏳</span><p>Loading from Supabase…</p></div>';

    const entries     = await storage.getMonthEntries();
    const today       = new Date();
    const daysSoFar   = today.getDate();
    let totalCats     = { spiritual: 0, skills: 0, health: 0, general: 0 };
    let daysLogged    = 0;

    Object.values(entries).forEach(entry => {
        if (entry.activities && entry.activities.length > 0) {
            daysLogged++;
            entry.activities.forEach(a => {
                if (totalCats[a.category] !== undefined) totalCats[a.category]++;
            });
        }
    });

    const consistency = Math.round((daysLogged / daysSoFar) * 100);
    const totalActs   = Object.values(totalCats).reduce((s, v) => s + v, 0);
    const monthScore  = totalActs > 0 ? Math.round(((totalCats.spiritual + totalCats.skills + totalCats.health) / totalActs) * 100) : 0;
    const insights    = generateInsights(totalCats, daysLogged, daysSoFar, consistency);

    container.innerHTML = `
        <div class="month-header">
            <h3>${today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        </div>
        <div class="week-stats">
            <div class="stat-card"><div class="stat-num">${consistency}%</div><div class="stat-label">Consistency</div></div>
            <div class="stat-card"><div class="stat-num">${daysLogged}/${daysSoFar}</div><div class="stat-label">Days Logged</div></div>
            <div class="stat-card"><div class="stat-num">${monthScore}%</div><div class="stat-label">Month Score</div></div>
            <div class="stat-card"><div class="stat-num">${totalActs}</div><div class="stat-label">Total Activities</div></div>
        </div>
        <div class="category-bars" style="margin-top:1.5rem">
            ${renderCategoryBar('Spiritual', totalCats.spiritual, totalActs, 'spiritual')}
            ${renderCategoryBar('Skills',    totalCats.skills,    totalActs, 'skills')}
            ${renderCategoryBar('Health',    totalCats.health,    totalActs, 'health')}
        </div>
        <div class="insights-box">
            <h3>💡 AI Insights</h3>
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
    // Show preview immediately
    const preview = document.getElementById('photo-preview');
    const reader  = new FileReader();
    reader.onload  = e => { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);

    document.getElementById('ocr-result').style.display   = 'none';
    document.getElementById('ocr-progress').style.display = 'block';
    document.getElementById('import-btn').style.display   = 'none';

    // Status callback — updates the progress label in real time
    const onStatus = (msg) => {
        const el = document.getElementById('ocr-status');
        if (el) el.textContent = msg;
        // Gemini is fast — animate the bar to show activity
        const bar = document.getElementById('ocr-progress-bar');
        if (bar) bar.style.width = '70%';
    };

    // Tesseract progress callback (fallback only)
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

        // ── Title page ──
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

        // ── One page per entry ──
        for (const date of dates) {
            const entry = entries[date];
            if (!entry || !entry.activities || entry.activities.length === 0) continue;
            doc.addPage();
            let y = 20;

            // Date header bar
            doc.setFillColor(13, 27, 75);
            doc.rect(0, 0, 210, 16, 'F');
            doc.setTextColor(245, 200, 66);
            doc.setFontSize(13); doc.setFont('helvetica', 'bold');
            const d = new Date(date + 'T00:00:00');
            doc.text(d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 10, 11);
            y = 26;

            // Activities
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

            // Reflection box
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
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    storage.init();

    const dateInput = document.getElementById('entry-date');
    dateInput.value = new Date().toISOString().slice(0, 10);
    dateInput.addEventListener('change', loadEntryForDate);

    addActivityField();
    setupDropzone();
    loadDailyScripture();
    generateStars();
    showTab('daily');
});
