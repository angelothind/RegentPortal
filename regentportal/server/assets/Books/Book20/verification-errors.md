# Book 20 verification errors

Checked: 14 Sep 2026  
Source: `Cambridge IELTS 20 Academic Student's Book` (DOCX on Desktop, plus PDF attachment)  
Assets: `regentportal/server/assets/Books/Book20/`

**Answers:** all 320 Reading and Listening keys in `markSchemes.json` match the source. Empty `answer` / `correctAnswers` fields in question JSON are placeholders; scoring uses `markSchemes.json`.  
**JSON:** all 41 files parse successfully.

This list is text/wording only. Harmless UI adaptations (markdown blanks, omitted “on your answer sheet”, option punctuation, title case) are not included.

---

## Test 1

### `Test1/passages/passage2.json`

| Where | Current | Expected |
| --- | --- | --- |
| `title` | `to Britain` | `The Return of the Elm?` |

Note: the supplied DOCX extract is truncated to `to Britain`. The published Cambridge title is the full heading above.

### `Test1/questions/Reading/part1.json`

Macron missing throughout Q1–13. Replace `kakapo` with `kākāpō` in:

- Q1–6 question stems
- notes title `New Zealand's kakapo`
- Q9, Q10, Protecting heading, Richard Henry line, Q11, Q13

### `Test1/questions/Reading/part3.json`

| Where | Current | Expected |
| --- | --- | --- |
| Q32 option G | `thought it more likely they would experience something bad.` | `thought it more likely that they would experience something bad.` |

### `Test1/questions/Listening/part3.json`

Missing heading before Q27–30: **Loneliness and mental health**

### `Test1/questions/Listening/part4.json`

| Where | Current | Expected |
| --- | --- | --- |
| Historical background bullet | `Rivers were traditionally used for transport, fishing and recreation.` | `Rivers were traditionally used by city dwellers for transport, fishing and recreation.` |
| Q39 | `goods can be transported` | `goods could be transported` |

---

## Test 2

### `Test2/questions/Listening/part1.json`

| Where | Current | Expected |
| --- | --- | --- |
| instruction | `Complete the notes below.` | `Complete the table below.` |

### `Test2/passages/passage3.json`

| Where | Current | Expected |
| --- | --- | --- |
| Sword paragraph | `talked about changing-from changing the bats` | `talked about changing – from changing the bats` |
| Noë quote | `[robe-umpires]` | `[robo-umpires]` |

---

## Test 3

### `Test3/passages/passage1.json`

Currency symbols are euros; Cambridge uses dollars:

- `€2.7 billion` → `$2.7 billion`
- `€67 billion` → `$67 billion`
- `€26.6 billion` → `$26.6 billion`
- `€40 billion` → `$40 billion`

### `Test3/questions/Reading/part3.json`

| Where | Current | Expected |
| --- | --- | --- |
| Q39 | `What does Wolpert emphasize ...` | `What does Wolpert emphasise ...` |

### `Test3/questions/Listening/part4.json`

| Where | Current | Expected |
| --- | --- | --- |
| Q36 | `mouse, keyboard, or their` | `mouse, keyboard or their` |

---

## Test 4

### `Test4/questions/Listening/part1.json`

| Where | Current | Expected |
| --- | --- | --- |
| Q6 | `________ which opens soon` | `________, which opens soon` |

### `Test4/questions/Listening/part3.json`

Missing heading before Q25–30: **Teaching handwriting**

### `Test4/questions/Reading/part1.json`

| Where | Current | Expected |
| --- | --- | --- |
| Q7 | trailing period after `from above.` | no trailing period |
| Q12 | `Abiquiu` | `Abiquiú` |

Passage 1 also uses `Abiquiu` without the accent (`Test4/passages/passage1.json`).

### `Test4/passages/passage2.json`

| Where | Current | Expected |
| --- | --- | --- |
| Paragraph B | `stormwater- management` | `stormwater-management` |

### `Test4/questions/Reading/part2.json`

| Where | Current | Expected |
| --- | --- | --- |
| List of People, option B | `Susanna Tol` | `Susanna Toi` |

The passage body already uses `Susanna Toi`. Cambridge print is inconsistent in places; use **Toi** to match the introduction/list.

---

## Files with no text issues found

**Test 1:** `passages/passage1.json`, `passages/passage3.json`, `questions/Listening/part1.json`, `questions/Listening/part2.json`, `questions/Reading/part2.json`

**Test 2:** `passages/passage1.json`, `passages/passage2.json`, `questions/Listening/part2.json`, `questions/Listening/part3.json`, `questions/Listening/part4.json`, `questions/Reading/part1.json`, `questions/Reading/part2.json`, `questions/Reading/part3.json`

**Test 3:** `passages/passage2.json`, `passages/passage3.json`, `questions/Reading/part1.json`, `questions/Reading/part2.json`, `questions/Listening/part1.json`, `questions/Listening/part2.json`, `questions/Listening/part3.json`

**Test 4:** `passages/passage3.json`, `questions/Listening/part2.json`, `questions/Listening/part4.json`, `questions/Reading/part3.json`
