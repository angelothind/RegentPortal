const fs = require('fs');
const path = require('path');

const TFNG = {
  T: 'TRUE',
  TRUE: 'TRUE',
  F: 'FALSE',
  FALSE: 'FALSE',
  NG: 'NOT GIVEN',
  'NOT GIVEN': 'NOT GIVEN',
};

const YSNG = {
  Y: 'YES',
  YES: 'YES',
  N: 'NO',
  NO: 'NO',
  NG: 'NOT GIVEN',
  'NOT GIVEN': 'NOT GIVEN',
};

const BOOK20_DIR = __dirname;

const collectStatementTypes = (testTitle, skill) => {
  const testFolder = testTitle.replace(/\s+/g, '');
  const skillFolder = skill === 'reading' ? 'Reading' : 'Listening';
  const questionsDir = path.join(BOOK20_DIR, testFolder, 'questions', skillFolder);
  const typesByNumber = {};

  if (!fs.existsSync(questionsDir)) {
    return typesByNumber;
  }

  for (const file of fs.readdirSync(questionsDir).filter((name) => name.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(questionsDir, file), 'utf8'));
    for (const template of data.templates || []) {
      if (template.questionType !== 'TFNG') continue;
      const kind = template.subType === 'YSNG' ? 'YSNG' : 'TFNG';
      for (const item of template.questionBlock || []) {
        if (item.questionNumber != null) {
          typesByNumber[String(item.questionNumber)] = kind;
        }
      }
    }
  }

  return typesByNumber;
};

const expandStatementAnswer = (raw, kind) => {
  if (typeof raw !== 'string') return raw;
  const table = kind === 'YSNG' ? YSNG : TFNG;
  const expanded = table[raw.trim().toUpperCase()] || table[raw.trim()];
  if (!expanded) {
    throw new Error(`Invalid ${kind} answer "${raw}". Store ${Object.values(table).filter((v, i, a) => a.indexOf(v) === i).join(', ')}.`);
  }
  return expanded;
};

const normalizePaper = (testTitle, skill, answers) => {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return answers;
  }

  const typesByNumber = collectStatementTypes(testTitle, skill);
  const normalized = { ...answers };

  for (const [questionNumber, value] of Object.entries(answers)) {
    const kind = typesByNumber[questionNumber];
    if (!kind) continue;
    normalized[questionNumber] = expandStatementAnswer(value, kind);
  }

  return normalized;
};

module.exports = { TFNG, YSNG, collectStatementTypes, expandStatementAnswer, normalizePaper };
