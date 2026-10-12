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
import { series, weekdayAvg, sportStats, trend, route, routeText, weeklyMinutes, daysBetween, weeklySteps, dayRange, cumulative, movingAvg, stepBuckets, weekdayVsWeekend, weeklyTotals, bestOf, heatCells, pointsOverTime } from './stats.ts';
import { challengeFor, groupTarget } from './challenge.ts';
import { weekGoal, weeksDone } from './weekly.ts';
import { parseDays } from './sync.ts';
import { kindOf } from './garden.ts';
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
assert.deepEqual(dayRange('2026-10-01', '2026-10-03'), ['2026-10-01', '2026-10-02', '2026-10-03']);
assert.deepEqual(cumulative([1, 2, 3]), [1, 3, 6]);
assert.deepEqual(movingAvg([2, 4, 6], 2), [2, 3, 5]);
assert.deepEqual(stepBuckets([0, 3000, 5000, 12000, 20000]), [1, 1, 1, 1]);
assert.deepEqual(weekdayVsWeekend([{ day: '2026-10-12', steps: 8000 }, { day: '2026-10-17', steps: 12000 }]), { weekday: 8000, weekend: 12000 });
assert.equal(bestOf(weeklyTotals([{ day: '2026-10-12', steps: 5 }, { day: '2026-10-14', steps: 7 }, { day: '2026-10-20', steps: 9 }]))!.value, 12);
const hc = heatCells([{ day: '2026-10-13', steps: 9 }], 2, '2026-10-14');
assert.equal(hc.length, 2); assert.equal(hc[1][1]!.steps, 9); assert.equal(hc[1][3], null);
assert.deepEqual(pointsOverTime([{ day: '2026-10-12', steps: 5000 }, { day: '2026-10-13', steps: 5000 }], [{ day: '2026-10-13', minutes: 30 }], ['2026-10-12', '2026-10-13']), [2, 5]);
assert.equal(kindOf('Piirtäminen'), 'luova');
assert.equal(kindOf('Sali'), 'urheilu');
const wg = weekGoal(
  [{ day: '2026-10-12', steps: 7500 }, { day: '2026-10-13', steps: 10500 }, { day: '2026-10-14', steps: 6000 }],
  [{ day: '2026-10-12', sport: 'Sali' }, { day: '2026-10-14', sport: 'Jooga' }, { day: '2026-10-13', sport: 'Lukeminen' }],
  '2026-10-14',
);
assert.equal(wg.sportDays, 2); assert.equal(wg.creativeDays, 1); assert.equal(wg.stepDaysOk, 2); assert.equal(wg.stepDaysElapsed, 3);
assert.equal(wg.creativeDone, true); assert.equal(wg.sportDone, false); assert.equal(wg.done, false);
assert.equal(wg.todayIsSport, true); assert.equal(wg.todayTarget, 7000);
// kokonainen täysi viikko: ma 5.10.–su 11.10.
const fullSteps = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'].map((day, i) => ({ day, steps: i < 3 ? 7000 : 10000 }));
const fullWork = [{ day: '2026-10-05', sport: 'Sali' }, { day: '2026-10-06', sport: 'Tennis' }, { day: '2026-10-07', sport: 'Jooga' }, { day: '2026-10-08', sport: 'Piirtäminen' }];
assert.equal(weeksDone(fullSteps, fullWork, '2026-10-14'), 1);
assert.equal(weeksDone(fullSteps, fullWork.slice(0, 2), '2026-10-14'), 0);
assert.equal(weeksDone([], [], '2026-10-14'), 0);
assert.deepEqual(parseDays({ steps: 8234 }, '2026-10-14'), [{ day: '2026-10-14', steps: 8234 }]);
assert.deepEqual(parseDays({ lines: '2026-10-14=8 234,0\n2026-10-13: 7120\nroskaa\n2026-10-14=100' }, '2026-10-14'), [{ day: '2026-10-13', steps: 7120 }, { day: '2026-10-14', steps: 8234 }]);
assert.deepEqual(parseDays({ days: [{ day: '2026-10-12', steps: 5000 }, { day: '2026-10-15', steps: 1 }, { day: '2026-09-01', steps: 1 }, { day: '2026-10-11', steps: 999999 }] }, '2026-10-14'), [{ day: '2026-10-12', steps: 5000 }]);
assert.deepEqual(parseDays({}, '2026-10-14'), []);
console.log('garden: ok');
