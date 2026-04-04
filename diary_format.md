# Waqa's Personal Diary — Gemini OCR Extraction Guide
# This file is loaded into every Gemini prompt for diary photo processing.
# Follow every rule precisely. Do not deviate.

---

## REAL DIARY PAGE EXAMPLE (March 20, 2026)

This is what an actual page looks like. Use it as your reference every time.

```
[top-left]  2026                     [top-center] SPEED & FAST EXECUTION    [top-right] 20 MARCH Friday
[first line] HARD EXECUTIONS, SLAVERY, KEEP MOVING                           ← IGNORE THIS LINE

- PRAYER                                                                      ← Extract: Prayer ~4:00
4:30 BIBLE STUDY    like lance dilution; soul                                 ← Extract: Bible Study 4:30 / ignore comment
5am BOOKS: 198-201  new lance dilution; soul                                  ← Extract: Books 5:00 / ignore page numbers & comment

1.5 WATER INTAKE:         URGENT TASK / BUILD PERSONAL APP                   ← Extract: 1.5L Water / ignore right-side notes
TRAINING: BOXING - covered by fast writing to fill                            ← Extract: Training - Boxing 30 min / ignore details

- get the brand from availabuta (NEW)(NEW)     AFTER SCHOOL DROP              ← Extract task / ignore right-side note
- make the list of second door screen material  PACK THE BAGS                 ← Extract task / ignore right-side note
- build Kitty recording app                     BAGS                          ← Extract task
- continue with writing app                                                   ← Extract task
- fix the loose patch bulb and buy new bulb holder  ATM / CATEGORISE         ← Extract task / ignore right-side note
- check bass mesh guitar effects                                              ← Extract task

- Withdraw $100 @ 4pm - Done                   ✓ CARE                        ← Extract financial task
  DIESEL: $50                                                                 ← Extract financial task
- 1pm leave for Drotalan, take loc / Trustees sign   LUNCH                   ← Extract task
- post YouTube video, worship - in progress          FOR                      ← Extract task
- research python & automation                       PLEASE                   ← Extract task

5pm PRAYER: 10mins                                                            ← Extract: Prayer 17:00, 10 min
7pm DEVOTION: Done                                                            ← Extract: Family Devotion 19:00
- bass training & BASS TEST                                                   ← Extract: Bass Training

REVIEW & REFLECTION - TIRED & KNOCKED OUT
- Training -
- Give main priority task
- Balance your running time to improve execution                              ← Extract all as review text
```

---

## EXPECTED JSON OUTPUT FOR THE EXAMPLE ABOVE

```json
{
  "date": "2026-03-20",
  "activities": [
    { "time": "04:00", "activity": "Prayer",                                      "duration": "",      "category": "spiritual" },
    { "time": "04:30", "activity": "Bible Study",                                 "duration": "",      "category": "spiritual" },
    { "time": "05:00", "activity": "Books",                                       "duration": "",      "category": "skills"    },
    { "time": "",      "activity": "1.5L Water Intake",                           "duration": "",      "category": "health"    },
    { "time": "",      "activity": "Training - Boxing",                           "duration": "30 min","category": "health"    },
    { "time": "",      "activity": "Get the brand from availabuta",               "duration": "",      "category": "general"   },
    { "time": "",      "activity": "Make list of second door screen material",    "duration": "",      "category": "general"   },
    { "time": "",      "activity": "Build Kitty recording app",                   "duration": "",      "category": "skills"    },
    { "time": "",      "activity": "Continue with writing app",                   "duration": "",      "category": "skills"    },
    { "time": "",      "activity": "Fix loose patch bulb and buy new bulb holder","duration": "",      "category": "general"   },
    { "time": "",      "activity": "Check bass mesh guitar effects",              "duration": "",      "category": "skills"    },
    { "time": "16:00", "activity": "Withdraw $100",                               "duration": "",      "category": "general"   },
    { "time": "",      "activity": "Diesel $50",                                  "duration": "",      "category": "general"   },
    { "time": "13:00", "activity": "Leave for Drotalan - Trustees sign",          "duration": "",      "category": "general"   },
    { "time": "",      "activity": "Post YouTube video - worship",                "duration": "",      "category": "skills"    },
    { "time": "",      "activity": "Research Python & automation",                "duration": "",      "category": "skills"    },
    { "time": "17:00", "activity": "Prayer",                                      "duration": "10 min","category": "spiritual" },
    { "time": "19:00", "activity": "Family Devotion",                             "duration": "",      "category": "spiritual" },
    { "time": "",      "activity": "Bass Training & Bass Test",                   "duration": "",      "category": "skills"    }
  ],
  "review": "Tired & knocked out. Training done. Give main priority task. Balance your running time to improve execution."
}
```

---

## PAGE LAYOUT — WHAT TO IGNORE

| Element | Location | Rule |
|---------|----------|------|
| Year (e.g. 2026) | Top-left corner | **IGNORE** |
| Topic / heading (e.g. "SPEED & FAST EXECUTION") | Top-center | **IGNORE** |
| First written line under the heading | First line of content | **IGNORE** |
| Right-side column notes (e.g. "URGENT TASK", "PACK THE BAGS", "LUNCH", "FOR", "PLEASE") | Right margin | **IGNORE** |
| Comments after activity names (e.g. "like lance dilution; soul") | Same line or below activity | **IGNORE** |
| Page numbers after Books (e.g. "198-201") | After "BOOKS" entry | **IGNORE** |
| Exercise details after Training (e.g. sets, reps, notes) | After "TRAINING" entry | **IGNORE** |

---

## DATE EXTRACTION

- **Year** → top-left (e.g. "2026")
- **Date & Month** → top-right (e.g. "20 MARCH Friday")
- Combine → return as `YYYY-MM-DD` (e.g. `2026-03-20`)
- If not legible → use today's date

---

## ACTIVITIES TO EXTRACT — CHRONOLOGICAL ORDER (4 AM → 9 PM)

### 1. Morning Prayer — ~4:00 AM
- Written as: `- PRAYER` or `4am PRAYER`
- **Extract:** "Prayer" + time (use 04:00 if no time shown)
- **Category:** `spiritual`
- **IGNORE:** Any text on the same line after Prayer (it is a personal comment)

### 2. Bible Study — ~4:30 AM
- Written as: `4:30 BIBLE STUDY` followed by a comment
- **Extract:** "Bible Study" + time written
- **Category:** `spiritual`
- **IGNORE:** Everything written after "BIBLE STUDY" on that line (e.g. "like lance dilution; soul")

### 3. Books / Reading — ~5:00 AM
- Written as: `5am BOOKS: 198-201` or `5am BOOKS`
- **Extract:** "Books" + time written
- **Category:** `skills`
- **IGNORE:** Page numbers (e.g. 198-201), book title, any notes after it

### 4. Water Intake — daily (no fixed time)
- Written as: `1.5 WATER INTAKE:` or `1.5L water`
- **Extract:** "1.5L Water Intake" — always include this
- **Category:** `health`
- **IGNORE:** Anything written to the right (right-column notes)

### 5. Training — daily (~30 min)
- Written as: `TRAINING: BOXING` or `TRAINING: RUNNING` etc.
- **Extract:** "Training - [type]" with duration "30 min"
- **Category:** `health`
- **IGNORE:** Any commentary, technique notes, or descriptions after it

### 6. Work / Day Tasks — after Training (variable)
- Written as bullet points with dashes: `- task description`
- **Extract:** The task name cleanly (remove dashes, fix handwriting)
- **Category:**
  - `skills` → coding, apps, research, YouTube, writing, recording, guitar
  - `general` → errands, shopping, money, driving, meetings, home tasks
- **IGNORE:** Right-column notes (e.g. "PACK THE BAGS", "LUNCH", "FOR", "PLEASE")
- **INCLUDE:** Financial tasks (withdraw, diesel, purchases) with amounts

### 7. Afternoon Prayer — ~3:00–5:00 PM *(non-working days or always record if present)*
- Written as: `5pm PRAYER: 10mins` or `3pm PRAYER`
- **Extract:** "Prayer" + time + duration if written
- **Category:** `spiritual`

### 8. Family Devotion — ~7:00 PM
- Written as: `7pm DEVOTION: Done` or `7pm DEVOTION`
- **Extract:** "Family Devotion" + time
- **Category:** `spiritual`
- **IGNORE:** Devotion content or notes

### 9. Bass Guitar / Bass Training — variable time
- Written as: `bass training & BASS TEST` or `base training`
- **Extract:** "Bass Training" + any test or practice note
- **Category:** `skills`

---

## REVIEW & REFLECTION — Bottom of Page (~9 PM)

- Written as: `REVIEW & REFLECTION` followed by bullet points
- **Extract:** All bullet points written under it as a single review string
- **If Waqa wrote reflection:** Copy it faithfully (clean handwriting errors)
- **If blank / nothing written:** Generate 2–3 sentences of AI encouragement based on the day's activities
- **Place in:** the `"review"` field

---

## CATEGORY QUICK REFERENCE

| Category | Activities |
|----------|-----------|
| `spiritual` | Morning Prayer, Bible Study, Afternoon Prayer, Family Devotion |
| `skills` | Books/Reading, Bass Guitar, Coding tasks, App building, Research, YouTube, Writing |
| `health` | Training (any type), Water Intake |
| `general` | Errands, shopping, driving, financial transactions, home tasks, meetings |

---

## OUTPUT RULES — NON-NEGOTIABLE

1. Return **ONLY** a raw JSON object — no markdown fences, no explanation
2. Activities must be in **chronological order** in the array
3. Times in **24-hour HH:MM** format (convert AM/PM if needed)
4. Activity names must be **clean** — no dashes, no comments, no right-column text
5. If no time shown for an activity → use empty string `""`
6. Water Intake → always include, even if no time
7. Training → always include duration `"30 min"` unless a different duration is written
8. Review → always populate (Waqa's words or AI encouragement)

---

*Tailored to Waqa Atunaise's personal diary — April 2026*
