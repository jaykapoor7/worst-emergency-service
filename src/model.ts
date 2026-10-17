export type Mechanic = "steer" | "rescue" | "magnet" | "timing" | "launch";
export type Effect =
  | "dinosaur"
  | "flood"
  | "pigeons"
  | "alien"
  | "fire"
  | "band"
  | "magnet"
  | "moon"
  | "wind"
  | "ducks"
  | "bureaucracy"
  | "crater";
export type Response = {
  label: string;
  mechanic: Mechanic;
  tool: string;
  result: string;
  effects: Effect[];
  next?: string;
};
export type SceneFlag =
  | "treeRemoved"
  | "houseChewed"
  | "bakeryOpenAir"
  | "mayorCabinet"
  | "ladderMoon"
  | "busFlying"
  | "firePermit";
export type Emergency = {
  id: string;
  caller: string;
  title: string;
  line: string;
  responses: Response[];
  tier: number;
  requires?: Effect;
  location: [number, number];
};
export type Evidence = {
  kind: Effect;
  x: number;
  y: number;
  quality: number;
  id: number;
};
export type World = {
  version: 1;
  count: number;
  seed: number;
  effects: Record<Effect, number>;
  flags: Record<SceneFlag, boolean>;
  evidence: Evidence[];
  anchors?: Partial<Record<Effect, { x: number; y: number }[]>>;
  history: { event: string; response: string; score: number }[];
  recent: string[];
  next?: string;
  promotions: number[];
  muted: boolean;
  catSaved: boolean;
  damage: number;
};
export type Outcome = {
  score: number;
  x: number;
  y: number;
  collisions: number;
};
export type Report = {
  text: string;
  score: number;
  label: string;
  assessment: string;
  event: string;
};
export type Session = {
  world: World;
  eventId: string;
  phase: "call" | "result" | "promotion";
  report?: Report;
};
export const titles = [
  { at: 0, title: "Junior dispatcher" },
  { at: 3, title: "Senior dispatcher" },
  { at: 6, title: "Head of emergencies" },
  { at: 10, title: "Director of public safety" },
  { at: 14, title: "Mayor" },
  { at: 19, title: "Governor" },
  { at: 25, title: "President" },
];
export function rank(count: number) {
  return [...titles].reverse().find((r) => count >= r.at)!;
}
export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
export function fresh(seed = Date.now() % 100000): World {
  return {
    version: 1,
    count: 0,
    seed,
    effects: {
      dinosaur: 0,
      flood: 0,
      pigeons: 0,
      alien: 0,
      fire: 0,
      band: 0,
      magnet: 0,
      moon: 0,
      wind: 0,
      ducks: 0,
      bureaucracy: 0,
      crater: 0,
    },
    flags: {
      treeRemoved: false,
      houseChewed: false,
      bakeryOpenAir: false,
      mayorCabinet: false,
      ladderMoon: false,
      busFlying: false,
      firePermit: false,
    },
    evidence: [],
    anchors: {},
    history: [],
    recent: [],
    promotions: [],
    muted: false,
    catSaved: false,
    damage: 0,
  };
}
export function resolve(
  w: World,
  e: Emergency,
  r: Response,
  o: Outcome,
): World {
  const score = clamp(Math.round(o.score), 0, 100);
  const flags = { ...w.flags };
  if (e.id === "cat" && r.mechanic !== "rescue" && score >= 55) flags.treeRemoved = true;
  if (e.id === "dino-house") flags.houseChewed = true;
  if (e.id === "roof" && r.mechanic === "magnet") flags.bakeryOpenAir = true;
  if (e.id === "mayor" && r.mechanic === "timing") flags.mayorCabinet = true;
  if (e.id === "ladder" && r.mechanic === "launch") flags.ladderMoon = true;
  if (e.id === "bus" || (e.id === "helipad" && r.mechanic === "rescue"))
    flags.busFlying = true;
  if (e.id === "fire-permit") flags.firePermit = true;
  const effects = { ...w.effects };
  r.effects.forEach((k) => (effects[k] = Math.min(5, effects[k] + 1)));
  const count = w.count + 1;
  const evidence = [
    ...w.evidence,
    ...r.effects.map((kind, i) => ({
      kind,
      x: clamp(o.x + i * 29, 60, 940),
      y: clamp(o.y + i * 8, 230, 580),
      quality: score,
      id: count * 10 + i,
    })),
  ].slice(-32);
  const anchors = { ...w.anchors };
  r.effects.forEach((kind, i) => {
    anchors[kind] = [
      ...(anchors[kind] || []),
      { x: clamp(o.x + i * 29, 60, 940), y: clamp(o.y + i * 8, 230, 580) },
    ].slice(-3);
  });
  return {
    ...w,
    count,
    effects,
    flags,
    evidence,
    anchors,
    history: [...w.history, { event: e.id, response: r.label, score }].slice(
      -100,
    ),
    recent: [...w.recent, e.id].slice(-7),
    next: r.next,
    catSaved: w.catSaved || (e.id === "cat" && score >= 55),
    damage: clamp(
      w.damage +
        (score < 40 ? 1 : 0) +
        o.collisions +
        (r.effects.includes("crater") ? 1 : 0),
      0,
      12,
    ),
  };
}
export const SAVE_KEY = "worst-emergency-service-v1";
export function validSession(raw: unknown): raw is Session {
  if (!raw || typeof raw !== "object") return false;
  const s = raw as Session;
  return (
    !!s.world &&
    s.world.version === 1 &&
    Number.isFinite(s.world.count) &&
    s.world.count >= 0 &&
    Number.isInteger(s.world.count) &&
    Array.isArray(s.world.evidence) &&
    s.world.evidence.length <= 32 &&
    (!s.world.anchors ||
      Object.entries(s.world.anchors).every(([kind, points]) =>
        kind in fresh(1).effects &&
        Array.isArray(points) &&
        points.length <= 3 &&
        points.every((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y))
      )) &&
    s.world.evidence.every(
      (a) =>
        a &&
        Number.isFinite(a.x) &&
        Number.isFinite(a.y) &&
        Number.isFinite(a.quality) &&
        a.kind in fresh(1).effects,
    ) &&
    Number.isFinite(s.world.seed) &&
    Number.isFinite(s.world.damage) &&
    typeof s.world.catSaved === "boolean" &&
    typeof s.world.muted === "boolean" &&
    Object.keys(fresh(1).flags).every(
      (k) => typeof s.world.flags?.[k as SceneFlag] === "boolean",
    ) &&
    Array.isArray(s.world.history) &&
    s.world.history.length <= 100 &&
    s.world.history.every(
      (h) =>
        h &&
        typeof h.event === "string" &&
        typeof h.response === "string" &&
        Number.isFinite(h.score),
    ) &&
    Array.isArray(s.world.recent) &&
    Array.isArray(s.world.promotions) &&
    s.world.promotions.every(Number.isFinite) &&
    typeof s.eventId === "string" &&
    ["call", "result", "promotion"].includes(s.phase) &&
    Object.keys(fresh(1).effects).every((k) =>
      Number.isFinite(s.world.effects?.[k as Effect]),
    ) &&
    (s.phase !== "result" || !!s.report)
  );
}
