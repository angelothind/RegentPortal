// Trust boundary for highlight payloads arriving from the student client.
// A behaviourally identical copy lives in `normalizeHighlightsState` in
// client/src/utils/textHighlightUtils.js (the browser normalizes the same data
// before painting it). Keep the two in sync.
const MAX_HIGHLIGHT_REGIONS = 20;
const MAX_HIGHLIGHT_RANGES_PER_REGION = 200;
const MAX_COMMENT_LENGTH = 2000;
const MAX_RANGE_OFFSET = 1000000;

// Region ids look like `reading-passage-1`, `reading-questions-2`,
// `listening-questions-3`. The pattern also keeps dotted and `$`-prefixed keys
// out of the Mongo write.
const REGION_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const FORBIDDEN_REGION_IDS = new Set(['__proto__', 'prototype', 'constructor']);

const isValidRegionId = (regionId) =>
  typeof regionId === 'string' &&
  REGION_ID_PATTERN.test(regionId) &&
  !FORBIDDEN_REGION_IDS.has(regionId);

const isValidRange = (range) =>
  !!range &&
  typeof range === 'object' &&
  Number.isInteger(range.start) &&
  Number.isInteger(range.end) &&
  range.start >= 0 &&
  range.end > range.start &&
  range.end <= MAX_RANGE_OFFSET;

const sanitizeHighlights = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const result = new Map();

  for (const [regionId, ranges] of Object.entries(value)) {
    if (result.size >= MAX_HIGHLIGHT_REGIONS) break;
    if (!isValidRegionId(regionId) || !Array.isArray(ranges)) continue;

    const normalizedRanges = [];

    for (const range of ranges.slice(0, MAX_HIGHLIGHT_RANGES_PER_REGION)) {
      if (!isValidRange(range)) continue;

      const item = {
        start: range.start,
        end: range.end,
      };

      if (typeof range.id === 'string' && range.id) {
        item.id = range.id;
      }

      if (typeof range.comment === 'string') {
        const comment = range.comment.trim().slice(0, MAX_COMMENT_LENGTH);
        if (comment) {
          item.comment = comment;
        }
      }

      normalizedRanges.push(item);
    }

    if (normalizedRanges.length) {
      result.set(regionId, normalizedRanges);
    }
  }

  // Object.fromEntries defines own properties, so no key can reach a prototype.
  return Object.fromEntries(result);
};

module.exports = sanitizeHighlights;
module.exports.MAX_HIGHLIGHT_REGIONS = MAX_HIGHLIGHT_REGIONS;
module.exports.MAX_HIGHLIGHT_RANGES_PER_REGION = MAX_HIGHLIGHT_RANGES_PER_REGION;
module.exports.MAX_COMMENT_LENGTH = MAX_COMMENT_LENGTH;
module.exports.MAX_RANGE_OFFSET = MAX_RANGE_OFFSET;
