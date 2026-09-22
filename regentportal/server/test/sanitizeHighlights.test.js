const { test } = require('node:test');
const assert = require('node:assert/strict');

const sanitizeHighlights = require('../utils/sanitizeHighlights');
const {
  MAX_HIGHLIGHT_REGIONS,
  MAX_HIGHLIGHT_RANGES_PER_REGION,
  MAX_COMMENT_LENGTH,
  MAX_RANGE_OFFSET
} = sanitizeHighlights;

test('sanitizeHighlights returns an empty object for non-object input', () => {
  assert.deepEqual(sanitizeHighlights(undefined), {});
  assert.deepEqual(sanitizeHighlights(null), {});
  assert.deepEqual(sanitizeHighlights('nope'), {});
  assert.deepEqual(sanitizeHighlights(42), {});
  assert.deepEqual(sanitizeHighlights([{ start: 0, end: 1 }]), {});
});

test('sanitizeHighlights keeps the region ids the app actually uses', () => {
  const input = {
    'reading-passage-1': [{ start: 0, end: 5, id: 'a', comment: '  hello  ' }],
    'reading-questions-2': [{ start: 3, end: 4 }],
    'listening-questions-3': [{ start: 7, end: 9 }]
  };

  assert.deepEqual(sanitizeHighlights(input), {
    'reading-passage-1': [{ start: 0, end: 5, id: 'a', comment: 'hello' }],
    'reading-questions-2': [{ start: 3, end: 4 }],
    'listening-questions-3': [{ start: 7, end: 9 }]
  });
});

test('sanitizeHighlights drops keys outside the allowlist', () => {
  const range = [{ start: 0, end: 1 }];
  const input = {
    'reading-passage-1': range,
    ['__proto__']: range,
    prototype: range,
    constructor: range,
    'dotted.key': range,
    $set: range,
    'a$b': range,
    'has space': range,
    'unicode-é': range,
    '': range,
    [`x${'y'.repeat(64)}`]: range
  };

  const result = sanitizeHighlights(input);

  assert.deepEqual(Object.keys(result), ['reading-passage-1']);
});

test('sanitizeHighlights does not let a __proto__ key pollute the result', () => {
  const payload = JSON.parse('{"__proto__": {"polluted": true}}');
  const result = sanitizeHighlights(payload);

  assert.deepEqual(result, {});
  assert.equal(result.polluted, undefined);
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal({}.polluted, undefined);
});

test('sanitizeHighlights rejects ranges that are not non-negative integers', () => {
  const input = {
    'reading-passage-1': [
      { start: -100, end: 1.5 },
      { start: 1.5, end: 3 },
      { start: -1, end: 4 },
      { start: 5, end: 5 },
      { start: 6, end: 2 },
      { start: 0, end: MAX_RANGE_OFFSET + 1 },
      { start: Number.NaN, end: 4 },
      { start: 0, end: Number.POSITIVE_INFINITY },
      { start: '0', end: '4' },
      null,
      'nope',
      { start: 2, end: 8 }
    ]
  };

  assert.deepEqual(sanitizeHighlights(input), {
    'reading-passage-1': [{ start: 2, end: 8 }]
  });
});

test('sanitizeHighlights drops regions whose value is not an array', () => {
  assert.deepEqual(
    sanitizeHighlights({ 'reading-passage-1': { start: 0, end: 1 }, 'reading-passage-2': 'nope' }),
    {}
  );
});

test('sanitizeHighlights drops regions left with no valid ranges', () => {
  assert.deepEqual(sanitizeHighlights({ 'reading-passage-1': [{ start: 4, end: 4 }] }), {});
});

test(`sanitizeHighlights caps regions at ${MAX_HIGHLIGHT_REGIONS}`, () => {
  const input = {};
  for (let i = 0; i < MAX_HIGHLIGHT_REGIONS + 5; i += 1) {
    input[`reading-passage-${i}`] = [{ start: 0, end: 1 }];
  }

  const result = sanitizeHighlights(input);

  assert.equal(Object.keys(result).length, MAX_HIGHLIGHT_REGIONS);
  assert.ok(result['reading-passage-0']);
  assert.equal(result[`reading-passage-${MAX_HIGHLIGHT_REGIONS}`], undefined);
});

test('sanitizeHighlights counts only valid regions against the region cap', () => {
  const input = { 'dotted.key': [{ start: 0, end: 1 }] };
  for (let i = 0; i < MAX_HIGHLIGHT_REGIONS; i += 1) {
    input[`reading-passage-${i}`] = [{ start: 0, end: 1 }];
  }

  const result = sanitizeHighlights(input);

  assert.equal(Object.keys(result).length, MAX_HIGHLIGHT_REGIONS);
  assert.ok(result[`reading-passage-${MAX_HIGHLIGHT_REGIONS - 1}`]);
});

test(`sanitizeHighlights caps ranges per region at ${MAX_HIGHLIGHT_RANGES_PER_REGION}`, () => {
  const ranges = [];
  for (let i = 0; i < MAX_HIGHLIGHT_RANGES_PER_REGION + 50; i += 1) {
    ranges.push({ start: i * 2, end: i * 2 + 1 });
  }

  const result = sanitizeHighlights({ 'reading-passage-1': ranges });

  assert.equal(result['reading-passage-1'].length, MAX_HIGHLIGHT_RANGES_PER_REGION);
});

test(`sanitizeHighlights truncates comments at ${MAX_COMMENT_LENGTH} characters`, () => {
  const result = sanitizeHighlights({
    'reading-passage-1': [{ start: 0, end: 1, comment: 'c'.repeat(MAX_COMMENT_LENGTH + 500) }]
  });

  assert.equal(result['reading-passage-1'][0].comment.length, MAX_COMMENT_LENGTH);
});

test('sanitizeHighlights strips empty comments, non-string comments and non-string ids', () => {
  const result = sanitizeHighlights({
    'reading-passage-1': [
      { start: 0, end: 1, comment: '   ', id: 42 },
      { start: 2, end: 3, comment: 99, id: '' },
      { start: 4, end: 5, extra: 'ignored' }
    ]
  });

  assert.deepEqual(result['reading-passage-1'], [
    { start: 0, end: 1 },
    { start: 2, end: 3 },
    { start: 4, end: 5 }
  ]);
});
