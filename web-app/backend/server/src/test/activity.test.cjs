const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeMalEntry } = require('../activity');
test('MAL estimate uses watched progress, not total episodes', () => {
  assert.deepEqual(normalizeMalEntry({ node: { title: 'Example', average_episode_duration: 1440 }, list_status: { num_episodes_watched: 3 } }), { title: 'Example', episodes: 3, seconds: 4320 });
});
test('unknown duration remains unavailable, not zero or fabricated', () => {
  assert.equal(normalizeMalEntry({ list_status: { num_episodes_watched: 4 } }).seconds, null);
});
test('zero progress is valid and malformed progress is excluded', () => {
  assert.equal(normalizeMalEntry({ node: { average_episode_duration: 1440 }, list_status: { num_episodes_watched: 0 } }).seconds, 0);
  for (const value of [-1, 1.5, '3', NaN]) assert.equal(normalizeMalEntry({ list_status: { num_episodes_watched: value } }), null);
});
