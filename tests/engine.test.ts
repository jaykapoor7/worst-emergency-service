import { test } from "node:test";
import assert from "node:assert/strict";
import { events, pick } from "../src/events";
import { fresh, rank, resolve, validSession } from "../src/model";
import { Operation } from "../src/operation";
const step = (op: Operation, seconds: number) => {
  for (let t = 0; t < seconds; t += 1 / 60) op.tick(1 / 60);
};
test("All authored branches have a valid follow-up and three working response mechanics", () => {
  assert.ok(events.length >= 30);
  for (const e of events) {
    assert.equal(e.responses.length, 3);
    for (const r of e.responses) {
      assert.ok(r.label && r.result);
      if (r.next)
        assert.ok(
          events.some((n) => n.id === r.next),
          `${e.id} -> ${r.next}`,
        );
    }
  }
});
test("The opening creates distinct causal follow-up calls", () => {
  for (const [i, next] of [
    [0, "firefighter"],
    [1, "dino-house"],
    [2, "pigeon"],
  ] as const) {
    const w = resolve(fresh(1), events[0], events[0].responses[i], {
      score: 80,
      x: 250,
      y: 340,
      collisions: 0,
    });
    assert.equal(pick(w).id, next);
    assert.ok(w.catSaved);
  }
});
test("National and cosmic calls stay locked until their promotion tier", () => {
  const early = fresh(1);
  early.count = 2;
  early.next = "moon";
  assert.notEqual(pick(early).id, "moon");
  early.count = 25;
  assert.equal(pick(early).id, "moon");
});
test("A local consequence can still create an early municipal callback", () => {
  const w = fresh(1);
  w.count = 2;
  w.next = "dino-job";
  w.effects.dinosaur = 1;
  assert.equal(pick(w).id, "dino-job");
});
test("One drag places a response at the chosen point", () => {
  const op = new Operation("steer", "dinosaur", [250, 340]);
  op.point(250, 340);
  op.release();
  assert.ok(op.finished);
  assert.ok(op.result!.score > 70);
  assert.ok(Math.hypot(op.result!.x - 250, op.result!.y - 340) < 46);
});
test("A bad steering response fails forward without removing its consequences", () => {
  const op = new Operation("steer", "dinosaur", [250, 340]);
  op.point(920, 550);
  op.release();
  assert.ok(op.finished);
  assert.ok(op.result!.score < 40);
  const w = resolve(fresh(1), events[0], events[0].responses[1], op.result!);
  assert.equal(w.effects.dinosaur, 1);
  assert.ok(w.damage > 0);
  assert.deepEqual(w.anchors?.dinosaur, [{ x: 920, y: 550 }]);
  assert.equal(w.flags.treeRemoved, false);
  assert.equal(w.catSaved, false);
});
test("A single magnet sweep collects cars and fixes the pile's location", () => {
  const op = new Operation("magnet", "magnet", [820, 525]);
  for (const car of op.cars) {
    op.point(car.x, car.y);
  }
  op.release();
  assert.equal(op.pickup.size, 3);
  assert.ok(op.finished);
  assert.equal(op.result!.x, 750);
  assert.equal(op.result!.score, 100);
});
test("A single rescue aim affects the final accuracy", () => {
  const good = new Operation("rescue", "helicopter", [250, 340]);
  good.point(215, 340);
  good.release();
  step(good, 1);
  assert.equal(good.result!.score, 100);
  const bad = new Operation("rescue", "helicopter", [250, 340]);
  bad.point(850, 340);
  bad.release();
  step(bad, 1);
  assert.equal(bad.result!.score, 0);
});
test("Launch uses one deliberate shot, an arc, and wind offset", () => {
  const op = new Operation("launch", "cone", [660, 350]);
  op.point(595, 350);
  op.act();
  step(op, 0.6);
  assert.ok(op.shotY < 300);
  step(op, 1);
  assert.ok(op.finished);
  assert.equal(op.result!.score, 100);
});
test("A demolition charge is placed with one tap", () => {
  const op = new Operation("timing", "stamp", [500, 300]);
  op.point(500, 300);
  op.release();
  assert.ok(op.finished);
  assert.ok(op.result!.score > 90);
});
test("Persistence accepts a completed session and rejects corrupt storage", () => {
  assert.equal(
    validSession({ world: fresh(1), eventId: "cat", phase: "call" }),
    true,
  );
  assert.equal(
    validSession({ world: { count: NaN }, eventId: "cat", phase: "call" }),
    false,
  );
  assert.equal(validSession(null), false);
  assert.equal(
    validSession({ world: fresh(1), eventId: "cat", phase: "result" }),
    false,
  );
});
test("Two hundred emergencies remain bounded, varied, persistent, and playable after President", () => {
  let w = fresh(42);
  let last = "";
  const ids = new Set<string>();
  for (let i = 0; i < 200; i++) {
    const e = pick(w);
    assert.notEqual(e.id, last);
    last = e.id;
    ids.add(e.id);
    const r = e.responses[i % 3];
    const oldEffects = { ...w.effects };
    w = resolve(w, e, r, {
      score: (i * 31) % 101,
      x: 250 + (i % 600),
      y: 350,
      collisions: i % 3 === 0 ? 1 : 0,
    });
    for (const key of Object.keys(oldEffects) as (keyof typeof oldEffects)[])
      assert.ok(w.effects[key] >= oldEffects[key]);
    assert.ok(w.evidence.length <= 32);
    assert.ok(w.history.length <= 100);
    assert.ok(w.recent.length <= 7);
    assert.equal(w.count, i + 1);
    assert.ok(validSession({ world: w, eventId: e.id, phase: "call" }));
  }
  assert.equal(rank(w.count).title, "President");
  assert.ok(ids.size > 22, `only ${ids.size} events`);
});

import { complete, advance, acknowledgePromotion } from "../src/session";
test("Thirty uninterrupted operations use the real session loop, award President, and continue after it", () => {
  let s = {
    world: fresh(7),
    eventId: "cat",
    phase: "call",
  } as import("../src/model").Session;
  let promotionCount = 0;
  for (let i = 0; i < 30; i++) {
    const e = events.find((e) => e.id === s.eventId)!,
      r = e.responses[i % 3];
    const target: [number, number] =
      r.mechanic === "magnet" ? [820, 525] : e.location;
    const op = new Operation(r.mechanic, r.tool, target);
    if (op.kind === "steer") {
      op.point(...target);
      op.release();
    } else if (op.kind === "magnet") {
      for (const car of op.cars) op.point(car.x, car.y);
      op.point(...target);
      op.release();
    } else if (op.kind === "timing") {
      op.point(...target);
      op.release();
    } else {
      op.point(target[0] - (op.kind === "launch" ? 65 : 35), target[1]);
      op.release();
      step(op, 1);
    }
    assert.ok(op.finished, `${i}:${op.kind} unfinished`);
    s = complete(s, i % 3, op.result!);
    assert.equal(s.phase, "result");
    s = JSON.parse(JSON.stringify(s));
    assert.ok(validSession(s));
    s = advance(s);
    if (s.phase === "promotion") {
      promotionCount++;
      s = acknowledgePromotion(s);
      if (i === 24) assert.equal(s.eventId, "moon");
    }
    assert.equal(s.phase, "call");
  }
  assert.equal(promotionCount, 6);
  assert.equal(s.world.count, 30);
  assert.equal(rank(s.world.count).title, "President");
});
test("Steering and magnet cannot auto-succeed from the start button", () => {
  for (const kind of ["steer", "magnet"] as const) {
    const op = new Operation(
      kind,
      kind === "steer" ? "dinosaur" : "magnet",
      [660, 350],
    );
    op.act();
    step(op, 14);
    assert.ok(op.finished);
    assert.ok(op.result!.score < 60);
    assert.equal(op.pickup.size, 0);
  }
});
