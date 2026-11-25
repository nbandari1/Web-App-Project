import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as analytics from './steamAnalytics.ts';

function service(fetch) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(new URL('./steamApi.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { exports, require: () => analytics, process: { env: {} }, fetch, Error, Set });
  return exports;
}
const game = id => ({ appId: id, name: `Game ${id}`, lifetimePlaytimeMinutes: 60, recentPlaytimeMinutes: null, iconUrl: null, lastPlayedAt: null });
const response = (data, status = 200) => ({ ok: status === 200, status, json: async () => data });
test('loads every library page using cookies and reports complete totals', async () => {
  const calls = [];
  const api = service(async (path, options) => {
    calls.push({ path, options });
    const offset = calls.length === 1 ? 0 : 100;
    return response({ totalCount: 101, offset, games: Array.from({ length: offset ? 1 : 100 }, (_, i) => game(offset + i + 1)) });
  });
  const result = await api.loadSteamLibrary(new AbortController().signal);
  assert.equal(result.games.length, 101);
  assert.equal(result.complete, true);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].options.credentials, 'include');
  assert.match(calls[1].path, /offset=100/);
});
test('partial and empty libraries do not invent totals', async () => {
  for (const count of [0, 4]) {
    const result = await service(async () => response({ totalCount: count, offset: 0, games: [] })).loadSteamLibrary(new AbortController().signal);
    assert.equal(result.complete, count === 0);
  }
});
test('recent activity preserves 14-day window, partial coverage and valid zero values', async () => {
  for (const complete of [true, false]) {
    const result = await service(async (path) => {
      assert.match(path, /activity\?count=100$/);
      return response({ windowDays: 14, games: [], summary: { returnedGameCount: 0, totalGameCount: complete ? 0 : 101, playtimeMinutes: 0, complete } });
    }).loadSteamRecent(new AbortController().signal);
    assert.equal(result.complete, complete);
    assert.equal(result.minutes, 0);
  }
  await assert.rejects(service(async () => response({ windowDays: 7, games: [], summary: {} })).loadSteamRecent(new AbortController().signal), /invalid recent/);
});
test('handles private profiles, expired authentication, malformed responses and network errors', async () => {
  for (const [status, message, expected] of [[403, 'Private profile', /Private profile/], [401, 'Unauthorized', /Sign in again/], [409, 'Connect first', /Connect first/], [503, 'Not configured', /Not configured/]]) {
    await assert.rejects(service(async () => response({ message }, status)).steamRequest('activity', new AbortController().signal), expected);
  }
  await assert.rejects(service(async () => response(null)).steamRequest('activity', new AbortController().signal), /invalid response/);
  await assert.rejects(service(async () => { throw new Error('Network down'); }).loadSteamLibrary(new AbortController().signal), /Network down/);
});
test('rejects duplicate games and changing library pagination', async () => {
  await assert.rejects(service(async () => response({ totalCount: 2, offset: 0, games: [game(1), game(1)] })).loadSteamLibrary(new AbortController().signal), /duplicate games/);
  let calls = 0;
  const api = service(async () => response(++calls === 1 ? { totalCount: 101, offset: 0, games: Array.from({ length: 100 }, (_, i) => game(i + 1)) } : { totalCount: 102, offset: 100, games: [game(101)] }));
  await assert.rejects(api.loadSteamLibrary(new AbortController().signal), /changed while loading/);
});

function connectionService(fetch, assign = () => {}) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(new URL('./api.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { exports, process: { env: { NEXT_PUBLIC_API_URL: 'https://backend.example/' } }, fetch, window: { location: { assign } } });
  return exports;
}
test('connection status restores from backend and concurrent consumers share one request', async () => {
  for (const connected of [true, false]) {
    let calls = 0;
    const api = connectionService(async (url, options) => {
      calls++;
      assert.equal(url, 'https://backend.example/api/steam/status');
      assert.equal(options.credentials, 'include');
      assert.equal(options.cache, 'no-store');
      return response({ connected });
    });
    assert.deepEqual(await Promise.all([api.getSteamConnectionStatus(), api.getSteamConnectionStatus()]), [connected, connected]);
    assert.equal(calls, 1);
    await api.getSteamConnectionStatus();
    assert.equal(calls, 2, 'settled status is not cached across refreshes');
  }
});
test('connect uses secure backend authorization; disconnect uses authenticated DELETE', async () => {
  let destination;
  const api = connectionService(async (url, options) => {
    assert.equal(url, 'https://backend.example/api/steam/connection');
    assert.equal(options.method, 'DELETE');
    assert.equal(options.credentials, 'include');
    return response({ connected: false });
  }, url => { destination = url; });
  api.startSteamAuthorization();
  assert.equal(destination, 'https://backend.example/api/steam/authorize');
  await api.disconnectSteam();
  await assert.rejects(connectionService(async () => response({}, 503)).disconnectSteam(), /disconnect Steam/);
  await assert.rejects(connectionService(async () => response({ connected: 'true' })).getSteamConnectionStatus(), /unavailable/);
  await assert.rejects(connectionService(async () => response(null)).getSteamConnectionStatus(), /unavailable/);
});
