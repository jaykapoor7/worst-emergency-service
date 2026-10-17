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
  const catMisses = [
    "The line missed the cat. The firefighter climbed the tree anyway and is now stuck above it.",
    "The dinosaur missed the tree. The cat is still up there. The dinosaur has found the neighbour's house.",
    "The tree survived. The pavement did not. The pigeons are filing a property claim.",
  ];
  return {
    world,
    eventId: e.id,
    phase: "result",
    report: {
      text: e.id === "cat" && outcome.score < 55 ? catMisses[choice] : r.result,
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
