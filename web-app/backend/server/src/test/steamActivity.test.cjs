const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeSteamGame } = require('../routes/steam/steamActivity');
test('Steam response preserves minutes and distinguishes missing recent playtime from zero', () => {
  const source = { appid: 10, name: 'Game', playtime_forever: 90 };
  assert.equal(normalizeSteamGame(source).lifetimePlaytimeMinutes, 90);
  assert.equal(normalizeSteamGame(source).recentPlaytimeMinutes, null);
  assert.equal(normalizeSteamGame({ ...source, playtime_2weeks: 0 }).recentPlaytimeMinutes, 0);
});
test('Steam rejects malformed lifetime playtime and safely constructs artwork URLs', () => {
  assert.equal(normalizeSteamGame({ appid: 10, playtime_forever: -1 }), null);
  const game = normalizeSteamGame({ appid: 10, playtime_forever: 0, img_icon_url: 'a'.repeat(40) });
  assert.equal(game.name, 'Steam game 10');
  assert.match(game.iconUrl, /^https:\/\/media.steampowered.com\//);
  assert.equal(game.lastPlayedAt, null);
});
