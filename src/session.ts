import { getEvent, pick } from "./events";
import { titles, resolve } from "./model";
import type { Session, Outcome } from "./model";
export function complete(
  s: Session,
  choice: number,
  outcome: Outcome,
): Session {
  const e = getEvent(s.eventId),
    r = e.responses[choice],
    world = resolve(s.world, e, r, outcome);
  return {
    world,
    eventId: e.id,
    phase: "result",
    report: {
      text: r.result,
      score: outcome.score,
      label: r.label,
      assessment:
        outcome.score > 65
          ? "Unnecessarily effective."
          : outcome.score > 25
            ? "A measurable amount of response."
            : "Within acceptable government tolerances.",
      event: e.title,
    },
  };
}
export function advance(s: Session): Session {
  if (
    titles.some(
      (t) =>
        t.at === s.world.count &&
        t.at > 0 &&
        !s.world.promotions.includes(t.at),
    )
  )
    return { ...s, phase: "promotion" };
  return { world: s.world, eventId: pick(s.world).id, phase: "call" };
}
export function acknowledgePromotion(s: Session): Session {
  const world = {
    ...s.world,
    promotions: [...new Set([...s.world.promotions, s.world.count])],
  };
  return { world, eventId: pick(world).id, phase: "call" };
}
