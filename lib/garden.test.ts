import assert from 'node:assert/strict';
import { points, stageFor, helsinkiDay, isDay, streak, bestStreak, dayBefore, ago, phaseOf, fairyName, weekStart } from './garden.ts';

assert.equal(points(12_345, 25), 4); // 4 askelpistettä, alle 30 min = 0
assert.equal(points(12_345, 60), 6); // 4 + 2
assert.equal(points(10_000, 90), 7); // 4 + 3
assert.equal(points(0, 600), 20); // urheilu yksinään antaa pisteitä
assert.equal(stageFor(0).stage.name, 'Siemen');
assert.equal(stageFor(5).stage.name, 'Itu');
assert.equal(stageFor(59).stage.name, 'Silmu');
assert.equal(stageFor(170).stage.name, 'Keijukuningatar');
assert.equal(stageFor(170).pct, 100);
assert.equal(helsinkiDay(new Date('2026-11-28T22:30:00Z')), '2026-11-29');
assert.ok(isDay('2026-10-09'));
assert.ok(!isDay('9.10.2026'));
assert.equal(streak([{ day: '2026-10-08', steps: 6000 }, { day: '2026-10-07', steps: 9000 }, { day: '2026-10-05', steps: 9000 }], '2026-10-09'), 2);
assert.equal(streak([{ day: '2026-10-09', steps: 5000 }], '2026-10-09'), 1);
assert.equal(streak([], '2026-10-09'), 0);
assert.equal(dayBefore('2026-03-01'), '2026-02-28');
assert.equal(bestStreak([{ day: '2026-10-01', steps: 6000 }, { day: '2026-10-02', steps: 6000 }, { day: '2026-10-03', steps: 100 }, { day: '2026-10-04', steps: 6000 }]), 2);
assert.equal(ago(null), 'ei vielä synkattu');
assert.equal(ago('2026-10-09T10:00:00Z', Date.parse('2026-10-09T13:00:00Z')), '3 t sitten');
assert.equal(phaseOf(new Date('2026-10-09T12:00:00Z')), 'day');
assert.equal(phaseOf(new Date('2026-10-09T22:00:00Z')), 'night');
assert.ok(fairyName(0, 0).length <= 30);
assert.equal(weekStart('2026-10-14'), '2026-10-12');
assert.equal(weekStart('2026-10-18'), '2026-10-12');
assert.equal(weekStart('2026-10-12'), '2026-10-12');
import { series, weekdayAvg, sportStats, trend, route, routeText, weeklyMinutes, daysBetween, weeklySteps } from './stats.ts';
import { challengeFor, groupTarget } from './challenge.ts';
const rows = [{ day: '2026-10-12', steps: 8000 }, { day: '2026-10-13', steps: 4000 }, { day: '2026-10-05', steps: 6000 }, { day: '2026-10-12', steps: 2000 }];
assert.equal(series(rows, 3, '2026-10-14').map((x) => x.steps).join(), '10000,4000,0');
assert.equal(weekdayAvg(rows)[0], 8000);
assert.equal(sportStats([{ sport: 'Juoksu', minutes: 30 }, { sport: 'Sali', minutes: 60 }, { sport: 'Juoksu', minutes: 45 }])[0].sport, 'Juoksu');
assert.equal(trend(rows, '2026-10-14').pct, 133);
assert.equal(trend([{ day: '2026-10-14', steps: 5 }], '2026-10-14').pct, null);
assert.equal(trend([{ day: '2026-10-14', steps: 150 }, { day: '2026-10-05', steps: 100 }], '2026-10-14').pct, 50);
assert.equal(route(20).reached, null);
assert.equal(route(112.5).reached, 'Lahti');
assert.equal(route(112.5).next, 'Tampere');
assert.equal(route(112.5).pct, 10);
assert.equal(routeText(112.5), 'Lahti ✓ · seuraava Tampere, 68 km');
assert.equal(routeText(20), 'Helsinki · seuraava Porvoo, 30 km');
assert.equal(route(50000).next, null);
assert.equal(weeklyMinutes([{ day: '2026-10-13', minutes: 30 }, { day: '2026-10-01', minutes: 20 }], 3, '2026-10-12').map((x) => x.minutes).join(), '20,0,30');
assert.equal(daysBetween('2026-10-01', '2026-10-03'), 3);
assert.equal(weeklySteps([{ day: '2026-10-13', steps: 5 }, { day: '2026-10-01', steps: 7 }], 3, '2026-10-12').map((x) => x.steps).join(), '7,0,5');
assert.equal(challengeFor('2026-10-12').id, challengeFor('2026-10-18').id);
assert.notEqual(challengeFor('2026-10-12').id, challengeFor('2026-10-19').id);
assert.equal(groupTarget(1), 50000);
console.log('garden: ok');
