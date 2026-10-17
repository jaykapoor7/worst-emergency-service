import { clamp } from "./model";
import type { Mechanic, Outcome } from "./model";
export const HELP: Record<
  Mechanic,
  { title: string; body: string; action: string; keyboard: string }
> = {
  steer: {
    title: "You are now driving the response.",
    body: "Hold anywhere in town to guide it. Reach the striped target and stay there. The red rooftops are best avoided.",
    action: "Start driving",
    keyboard: "Arrow keys steer · Space starts",
  },
  rescue: {
    title: "Lower the line. Ideally onto the caller.",
    body: "Move the helicopter left or right. Release to lower the rescue line. Wind shifts it right. Three attempts.",
    action: "Lower rescue line",
    keyboard: "← → aim · Space lowers",
  },
  magnet: {
    title: "A modest amount of magnetic force.",
    body: "Hold and drag the magnet around town. Pick up all three stranded cars. Bring them to the striped depot.",
    action: "Activate magnet",
    keyboard: "Arrow keys move · Space starts",
  },
  timing: {
    title: "Three signatures. No qualifications.",
    body: "Tap AUTHORIZE when the moving needle is inside the green zone. Each stamp changes the precision of the operation.",
    action: "Authorize",
    keyboard: "Space authorizes",
  },
  launch: {
    title: "Delivery window: immediately.",
    body: "Choose a landing point on the town, then release to launch. Account for the wind. Two deliveries. Try to hit the striped target.",
    action: "Launch delivery",
    keyboard: "Arrow keys position · Space launches",
  },
};
export class Operation {
  kind: Mechanic;
  tool: string;
  target: { x: number; y: number };
  x = 90;
  y = 490;
  aim = { x: 500, y: 370 };
  time = 0;
  started = false;
  finished = false;
  settle = 0;
  held = false;
  keys = new Set<string>();
  shots: number[] = [];
  pickup = new Set<number>();
  cars = [
    { x: 270, y: 460 },
    { x: 510, y: 445 },
    { x: 750, y: 500 },
  ];
  collisions = 0;
  collided = new Set<number>();
  hold = 0;
  shotTime = -1;
  shotX = 0;
  shotY = 0;
  landX = 0;
  landY = 0;
  lastStamp = -2;
  lastQuality = 0;
  result: Outcome | null = null;
  goal = false;
  constructor(kind: Mechanic, tool: string, target: [number, number]) {
    this.kind = kind;
    this.tool = tool;
    this.target = {
      x: clamp(target[0], 100, 900),
      y: clamp(target[1], 260, 545),
    };
    this.aim =
      kind === "steer" || kind === "magnet"
        ? { x: this.x, y: this.y }
        : { x: 500, y: 500 };
  }
  start() {
    this.started = true;
  }
  point(x: number, y: number) {
    this.aim = { x: clamp(x, 50, 950), y: clamp(y, 240, 560) };
    this.start();
  }
  act() {
    if (
      this.finished ||
      this.shotTime >= 0 ||
      this.shots.length >= (this.kind === "launch" ? 2 : 3)
    )
      return;
    this.start();
    if (this.kind === "timing") {
      if (this.time - this.lastStamp < 0.8 || this.shots.length >= 3) return;
      this.lastStamp = this.time;
      this.lastQuality = clamp(
        100 - Math.abs(this.needle() - 68) * 3.5,
        0,
        100,
      );
      this.shots.push(this.lastQuality);
    } else if (this.kind === "rescue" || this.kind === "launch") {
      this.shotTime = this.time;
      this.landX = this.aim.x + (this.kind === "launch" ? 65 : 35);
      this.landY = this.kind === "rescue" ? this.target.y : this.aim.y;
    }
  }
  needle() {
    return 50 + Math.sin(this.time * 2.9 - 0.7) * 46;
  }
  tick(dt: number) {
    if (!this.started || this.finished) return;
    this.time += Math.min(0.05, dt);
    const speed = this.kind === "steer" ? 155 : 250;
    const dkey = 240 * dt;
    if (this.keys.has("ArrowLeft")) this.aim.x -= dkey;
    if (this.keys.has("ArrowRight")) this.aim.x += dkey;
    if (this.keys.has("ArrowUp")) this.aim.y -= dkey;
    if (this.keys.has("ArrowDown")) this.aim.y += dkey;
    this.aim.x = clamp(this.aim.x, 50, 950);
    this.aim.y = clamp(this.aim.y, 240, 560);
    if (this.kind === "steer" || this.kind === "magnet") {
      const dx = this.aim.x - this.x,
        dy = this.aim.y - this.y,
        d = Math.hypot(dx, dy);
      if (d > 1) {
        this.x += (dx / d) * Math.min(speed * dt, d);
        this.y += (dy / d) * Math.min(speed * dt, d);
      }
      if (this.kind === "steer") {
        [
          [350, 335],
          [500, 320],
          [770, 330],
        ].forEach(([x, y], i) => {
          if (
            Math.hypot(this.x - x, this.y - y) < 37 &&
            !this.collided.has(i)
          ) {
            this.collided.add(i);
            this.collisions++;
          }
        });
        this.hold =
          Math.hypot(this.x - this.target.x, this.y - this.target.y) < 46
            ? this.hold + dt
            : Math.max(0, this.hold - dt * 0.4);
        this.goal = this.hold > 0.6;
        if (this.goal && this.time >= 5)
          this.end(100 - this.collisions * 18, this.x, this.y);
      } else {
        this.cars.forEach((c, i) => {
          if (Math.hypot(this.x - c.x, this.y - c.y) < 62) this.pickup.add(i);
        });
        this.goal =
          this.pickup.size === 3 &&
          Math.hypot(this.x - this.target.x, this.y - this.target.y) < 65;
        if (this.goal && this.time >= 5)
          this.end(100 - this.time * 2, this.x, this.y);
      }
    }
    if (this.shotTime >= 0) {
      const p = clamp((this.time - this.shotTime) / 1.25, 0, 1);
      if (this.kind === "rescue") {
        this.shotX = this.aim.x + 35 * p;
        this.shotY = 140 + (this.target.y - 140) * p;
      } else {
        this.shotX = 90 + (this.landX - 90) * p;
        this.shotY = 500 + (this.landY - 500) * p - Math.sin(p * Math.PI) * 220;
      }
      if (p >= 1) {
        this.lastQuality = clamp(
          100 -
            Math.hypot(this.landX - this.target.x, this.landY - this.target.y) *
              0.6,
          0,
          100,
        );
        this.shots.push(this.lastQuality);
        this.lastStamp = this.time;
        this.shotTime = -1;
      }
    }
    const required =
      this.kind === "rescue" ? 3 : this.kind === "launch" ? 2 : 3;
    if (
      ["rescue", "launch", "timing"].includes(this.kind) &&
      this.shots.length >= required &&
      this.time >= 5
    )
      this.end(
        this.shots.reduce((a, b) => a + b, 0) / this.shots.length,
        this.kind === "timing" ? this.target.x : this.landX,
        this.kind === "timing" ? this.target.y : this.landY,
      );
    if (this.time >= 13) {
      const score =
        this.kind === "magnet"
          ? this.pickup.size * 24
          : this.kind === "steer"
            ? Math.max(
                0,
                85 -
                  Math.hypot(this.x - this.target.x, this.y - this.target.y) *
                    0.15,
              )
            : this.shots.length
              ? this.shots.reduce((a, b) => a + b, 0) / required
              : 0;
      this.end(
        score,
        this.kind === "steer" || this.kind === "magnet"
          ? this.x
          : this.landX || this.target.x,
        this.kind === "steer" || this.kind === "magnet"
          ? this.y
          : this.landY || this.target.y,
      );
    }
  }
  end(score: number, x: number, y: number) {
    if (this.finished) return;
    this.finished = true;
    this.result = {
      score: clamp(Math.round(score), 0, 100),
      x: clamp(x, 50, 950),
      y: clamp(y, 240, 570),
      collisions: this.collisions,
    };
  }
}
