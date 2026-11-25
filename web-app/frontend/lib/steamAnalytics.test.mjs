import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterGames, gameChartItems, hours, parseGames, summarizeGames } from './steamAnalytics.ts';
const game = (appId, name, lifetimePlaytimeMinutes, recentPlaytimeMinutes = null) => ({ appId, name, lifetimePlaytimeMinutes, recentPlaytimeMinutes, iconUrl: null, lastPlayedAt: null });
const games = [game(1, 'Zulu', 120, 0), game(2, 'Alpha', 60, 30), game(3, 'Unknown recent', 0)];
test('converts minutes into hours and includes unplayed owned games in average', () => {
  assert.equal(hours(90), '1.5 h');
  assert.deepEqual(summarizeGames(games), { minutes: 180, average: 60, mostPlayed: games[0] });
  assert.deepEqual(summarizeGames([]), { minutes: 0, average: 0, mostPlayed: null });
});
test('search and all sorts preserve the original library and distinguish unknown recent time', () => {
  assert.deepEqual(filterGames(games, ' ALP ', 'name'), [games[1]]);
  assert.deepEqual(filterGames(games, '', 'recent'), [games[1], games[0], games[2]]);
  assert.deepEqual(filterGames(games, '', 'lifetime'), games);
  assert.deepEqual(filterGames(games, '', 'name'), [games[1], games[2], games[0]]);
  assert.equal(games[0].name, 'Zulu');
});
test('validates playtime responses without turning missing data into zero', () => {
  assert.deepEqual(parseGames(games), games);
  for (const value of [null, {}, [game(1, 'Bad', -1)], [game(1, 'Bad', NaN)], [{ ...games[0], recentPlaytimeMinutes: undefined }]]) assert.throws(() => parseGames(value));
  assert.equal(parseGames([{ ...games[0], iconUrl: 'javascript:alert(1)' }])[0].iconUrl, null);
});
test('charts preserve all known hours in Other games and keep recent and lifetime windows separate', () => {
  const many = Array.from({ length: 8 }, (_, i) => game(i + 1, `Game ${i}`, (i + 1) * 60, i === 0 ? 30 : null));
  const chart = gameChartItems(many, 'lifetime');
  assert.equal(chart.top.length, 5);
  assert.equal(chart.top[0].value, 8);
  assert.equal(chart.distribution.at(-1).label, 'Other games');
  assert.equal(chart.distribution.reduce((sum, item) => sum + item.value, 0), 36);
  assert.deepEqual(gameChartItems(many, 'recent').distribution, [{ label: 'Game 0', value: 0.5 }]);
  assert.deepEqual(gameChartItems([], 'lifetime'), { top: [], distribution: [] });
});
