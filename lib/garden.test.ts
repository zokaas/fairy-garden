import assert from 'node:assert/strict';
import { sportPoints, stepPointsOf, points, creativeCountedMins, workoutPoints, inContest, growthIdx, helsinkiDay, isDay, streak, bestStreak, dayBefore, ago, phaseOf, fairyName, weekStart } from './garden.ts';

assert.equal(points([{ steps: 12_345 }], [{ day: '2026-10-13', sport: 'Sali', minutes: 25 }]), 4.5); // 4 askelpistettä, alle 30 min = 0
assert.equal(points([{ steps: 12_345 }], [{ day: '2026-10-13', sport: 'Sali', minutes: 60 }]), 6); // 4 + 2
assert.equal(points([{ steps: 10_000 }], [{ day: '2026-10-13', sport: 'Sali', minutes: 90 }]), 7); // 4 + 3
assert.equal(points([], [{ day: '2026-10-13', sport: 'Sali', minutes: 600 }]), 20); // urheilu yksinään antaa pisteitä
assert.equal(growthIdx(0), 0);
assert.equal(growthIdx(3), 1);
assert.equal(growthIdx(35), 3);
assert.equal(growthIdx(50), 5);
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
import { weekGoal, weeksDone, goalHistory, flowerDays, dayFlowers } from './weekly.ts';
import { parseDays } from './sync.ts';
import { syncWatch } from './watch.ts';
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
// 6/7 päivää riittää: yksi askelpäivä voi jäädä alle
assert.equal(weeksDone(fullSteps.map((x, i) => (i === 6 ? { ...x, steps: 100 } : x)), fullWork, '2026-10-14'), 1);
assert.equal(weeksDone(fullSteps.map((x, i) => (i >= 5 ? { ...x, steps: 100 } : x)), fullWork, '2026-10-14'), 0);
assert.equal(weeksDone(fullSteps, fullWork.slice(0, 2), '2026-10-14'), 0);
assert.equal(weeksDone([], [], '2026-10-14'), 0);
assert.deepEqual(parseDays({ steps: 8234 }, '2026-10-14'), [{ day: '2026-10-14', steps: 8234 }]);
assert.deepEqual(parseDays({ lines: '2026-10-14=8 234,0\n2026-10-13: 7120\nroskaa\n2026-10-14=100' }, '2026-10-14'), [{ day: '2026-10-13', steps: 7120 }, { day: '2026-10-14', steps: 8234 }]);
assert.deepEqual(parseDays({ values: '7120\n8 234' }, '2026-10-14'), [{ day: '2026-10-13', steps: 7120 }, { day: '2026-10-14', steps: 8234 }]);
assert.deepEqual(parseDays({ values: '8234\n7120', newest: 'first' }, '2026-10-14'), [{ day: '2026-10-13', steps: 7120 }, { day: '2026-10-14', steps: 8234 }]);
assert.deepEqual(parseDays({ days: [{ day: '2026-10-12', steps: 5000 }, { day: '2026-10-15', steps: 1 }, { day: '2026-09-01', steps: 1 }, { day: '2026-10-11', steps: 999999 }] }, '2026-10-14'), [{ day: '2026-10-12', steps: 5000 }]);
assert.deepEqual(parseDays({}, '2026-10-14'), []);
assert.deepEqual(parseDays({ lines: '2026-10-14=8,234\n2026-10-13=12,345.6\n2026-10-12=8234,5' }, '2026-10-14').map((x) => x.steps), [8235, 12346, 8234]);
const mk = (id: string) => ({ id, name: id }) as never;
const w = syncWatch(
  [mk('a'), mk('b'), mk('c'), mk('d')],
  [
    { fairy_id: 'a', day: '2026-10-13', steps: 5 }, { fairy_id: 'a', day: '2026-10-12', steps: 5 }, { fairy_id: 'a', day: '2026-10-11', steps: 5 },
    { fairy_id: 'b', day: '2026-10-11', steps: 5 }, { fairy_id: 'b', day: '2026-10-13', steps: 5 },
    { fairy_id: 'c', day: '2026-10-05', steps: 5 },
  ],
  '2026-10-14',
);
assert.deepEqual(w.map((x) => `${x.fairy.id}:${x.level}:${x.missing.length}`), ['d:never:0', 'c:alert:3', 'b:warn:1', 'a:ok:0']);
assert.deepEqual(w.find((x) => x.fairy.id === 'b')!.missing, ['2026-10-12']);
assert.equal(goalHistory(fullSteps, fullWork, '2026-10-14').length, 2);
assert.equal(goalHistory(fullSteps, fullWork, '2026-10-14')[0].g.done, true);
assert.deepEqual(goalHistory([], [], '2026-10-14'), []);
assert.equal(flowerDays([{ day: '2026-10-12', steps: 7500 }, { day: '2026-10-13', steps: 9000 }, { day: '2026-10-14', steps: 10000 }], [{ day: '2026-10-12', sport: 'Sali' }, { day: '2026-10-13', sport: 'Lukeminen' }]), 2);
// luovalla viikkokatto 120 min; urheilu rajaton; uusi viikko nollaa
const cr = (day: string, minutes: number) => ({ day, sport: 'Lukeminen', minutes });
assert.equal(creativeCountedMins([cr('2026-10-12', 90), cr('2026-10-14', 90)]), 120);
assert.equal(creativeCountedMins([cr('2026-10-12', 100), cr('2026-10-19', 100)]), 200);
assert.equal(workoutPoints([cr('2026-10-12', 300), { day: '2026-10-13', sport: 'Sali', minutes: 300 }]), 4 + 10);
assert.equal(inContest('2026-10-11'), false);
assert.equal(inContest('2026-10-12'), true);
assert.equal(sportPoints(45), 1.5);
assert.equal(sportPoints(14), 0);
assert.equal(sportPoints(15), 0.5);
assert.deepEqual(parseDays({ values: '100\n17 000', values2: '90\n8 800' }, '2026-10-14'), [{ day: '2026-10-13', steps: 100 }, { day: '2026-10-14', steps: 17000 }]);
assert.deepEqual(parseDays({ values: '0\n0', values2: '7000\n8800' }, '2026-10-14'), [{ day: '2026-10-13', steps: 7000 }, { day: '2026-10-14', steps: 8800 }]);
import { forecast } from './forecast.ts';
const f1 = forecast(40_000, '2026-10-19', '2026-11-27')!; // 5 000 / pv -> 62 pv -> jää haaveeksi
assert.equal(f1.onTrack, false);
const f2 = forecast(80_000, '2026-10-19', '2026-11-27')!; // 10 000 / pv -> 27 pv -> 15.11.
assert.equal(f2.onTrack, true);
assert.equal(f2.finish, '2026-11-15');
assert.equal(forecast(0, '2026-10-19', '2026-11-27'), null);
assert.equal(forecast(400_000, '2026-10-19', '2026-11-27')!.onTrack, true);
// askelpisteet lasketaan päivittäin: 2 400 + 2 400 = 0 p, 5 000 + 2 600 = 2 + 1 = 3 p
assert.equal(stepPointsOf([{ steps: 2_400 }, { steps: 2_400 }]), 0);
assert.equal(stepPointsOf([{ steps: 5_000 }, { steps: 2_600 }]), 3);
import { loggableDays } from './garden.ts';
assert.equal(loggableDays('2026-10-14').length, 3); // 14., 13., 12.10. (kisa alkaa 12.10.)
assert.equal(loggableDays('2026-10-14')[0], '2026-10-14');
assert.equal(loggableDays('2026-10-25').length, 8); // tänään + 7 päivää taaksepäin
assert.equal(loggableDays('2026-10-25')[7], '2026-10-18');
console.log('garden: ok');

assert.equal(dayFlowers(9999, 10000), 0);
assert.equal(dayFlowers(10000, 10000), 1);
assert.equal(dayFlowers(19999, 10000), 1);
assert.equal(dayFlowers(20000, 10000), 2);
assert.equal(dayFlowers(30000, 10000), 3);
assert.equal(dayFlowers(17000, 7000), 2);
assert.equal(flowerDays([{ day: '2026-10-12', steps: 30000 }], []), 3);

// Puhelimen oma päivä (aikavyöhyke): Portugalissa klo 01 Suomen aikaa puhelimen päivä on vielä edellinen.
assert.deepEqual(parseDays({ values: '7120\n8234', today: '2026-10-13' }, '2026-10-14'), [{ day: '2026-10-12', steps: 7120 }, { day: '2026-10-13', steps: 8234 }]);
assert.deepEqual(parseDays({ values: '7120\n8234', today: '2026-10-15' }, '2026-10-14'), [{ day: '2026-10-14', steps: 7120 }, { day: '2026-10-15', steps: 8234 }]);
assert.deepEqual(parseDays({ values: '7120\n8234', today: '2026-10-20' }, '2026-10-14'), [{ day: '2026-10-13', steps: 7120 }, { day: '2026-10-14', steps: 8234 }]);
assert.deepEqual(parseDays({ values: '8234', today: 'roskaa' }, '2026-10-14'), [{ day: '2026-10-14', steps: 8234 }]);
