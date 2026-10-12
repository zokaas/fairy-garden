import assert from 'node:assert/strict';
import { points, stageFor, helsinkiDay, isDay, streak } from './garden.ts';

assert.equal(points(12_345, 25), 14);
assert.equal(stageFor(0).stage.name, 'Siemen');
assert.equal(stageFor(10).stage.name, 'Itu');
assert.equal(stageFor(99).stage.name, 'Silmu');
assert.equal(stageFor(500).stage.name, 'Keijukuningatar');
assert.equal(stageFor(500).pct, 100);
assert.equal(helsinkiDay(new Date('2026-11-28T22:30:00Z')), '2026-11-29');
assert.ok(isDay('2026-10-09'));
assert.ok(!isDay('9.10.2026'));
assert.equal(streak([{ day: '2026-10-08', steps: 6000 }, { day: '2026-10-07', steps: 9000 }, { day: '2026-10-05', steps: 9000 }], '2026-10-09'), 2);
assert.equal(streak([{ day: '2026-10-09', steps: 5000 }], '2026-10-09'), 1);
assert.equal(streak([], '2026-10-09'), 0);
console.log('garden: ok');
