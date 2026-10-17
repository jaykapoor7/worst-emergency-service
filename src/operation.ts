import { clamp } from "./model";
import type { Mechanic, Outcome } from "./model";

export const HELP: Record<Mechanic, { title: string; body: string; keyboard: string }> = {
  steer: { title: "Take it into town.", body: "Drag your response onto the striped target and let go. Where you release is where it ends up.", keyboard: "Arrow keys move · Space releases" },
  rescue: { title: "One line. One chance.", body: "Tap or click where the rescue line should land. The wind nudges it right.", keyboard: "← → aim · Space lowers" },
  magnet: { title: "Sweep the town.", body: "Drag the magnet through the cars, then let go. Everything it touches comes along.", keyboard: "Arrow keys move · Space releases" },
  timing: { title: "Choose the blast site.", body: "Tap or click where the demolition charge should go. The town will remember the spot.", keyboard: "Arrow keys aim · Space places" },
  launch: { title: "Send it flying.", body: "Tap or click a landing spot. The wind adds a little distance to the right.", keyboard: "Arrow keys aim · Space launches" },
};

// A response is one deliberate gesture. Its final coordinates become world state.
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
  cars = [{ x: 270, y: 460 }, { x: 510, y: 445 }, { x: 750, y: 500 }];
  collisions = 0;
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
    this.target = { x: clamp(target[0], 100, 900), y: clamp(target[1], 260, 545) };
    this.aim = kind === "steer" || kind === "magnet" ? { x: this.x, y: this.y } : { ...this.target };
  }
  start() { this.started = true; }
  point(x: number, y: number) {
    if (this.finished || this.shotTime >= 0) return;
    const from = { ...this.aim };
    this.aim = { x: clamp(x, 50, 950), y: clamp(y, 240, 560) };
    this.start();
    if (this.kind === "steer" || this.kind === "magnet") {
      this.x = this.aim.x;
      this.y = this.aim.y;
      if (this.kind === "magnet") this.collectBetween(from, this.aim);
    }
  }
  collectBetween(from: { x: number; y: number }, to: { x: number; y: number }) {
    const dx = to.x - from.x, dy = to.y - from.y;
    this.cars.forEach((car, i) => {
      const t = clamp(((car.x - from.x) * dx + (car.y - from.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
      if (Math.hypot(car.x - (from.x + dx * t), car.y - (from.y + dy * t)) < 62) this.pickup.add(i);
    });
  }
  act() {
    if (this.finished || this.shotTime >= 0) return;
    this.start();
    if (this.kind === "steer" || this.kind === "magnet") { this.release(); return; }
    if (this.kind === "timing") {
      this.end(100 - Math.hypot(this.aim.x - this.target.x, this.aim.y - this.target.y) * 0.25, this.aim.x, this.aim.y);
      return;
    }
    this.shotTime = this.time;
    this.landX = clamp(this.aim.x + (this.kind === "launch" ? 65 : 35), 50, 950);
    this.landY = this.aim.y;
  }
  release() {
    if (this.finished) return;
    if (this.kind === "steer") this.end(100 - Math.hypot(this.x - this.target.x, this.y - this.target.y) * 0.3, this.x, this.y);
    else if (this.kind === "magnet") this.end(this.pickup.size * 30 + 10, this.x, this.y);
    else this.act();
  }
  needle() { return 68; }
  tick(dt: number) {
    if (this.finished || !this.started) return;
    const frame = Math.min(0.05, dt);
    this.time += frame;
    const speed = 330 * frame;
    if (this.keys.has("ArrowLeft")) this.aim.x -= speed;
    if (this.keys.has("ArrowRight")) this.aim.x += speed;
    if (this.keys.has("ArrowUp")) this.aim.y -= speed;
    if (this.keys.has("ArrowDown")) this.aim.y += speed;
    this.aim.x = clamp(this.aim.x, 50, 950);
    this.aim.y = clamp(this.aim.y, 240, 560);
    if (this.kind === "steer" || this.kind === "magnet") {
      const from = { x: this.x, y: this.y };
      this.x = this.aim.x; this.y = this.aim.y;
      if (this.kind === "magnet") this.collectBetween(from, this.aim);
    }
    if (this.shotTime >= 0) {
      const p = clamp((this.time - this.shotTime) / 0.75, 0, 1);
      if (this.kind === "rescue") {
        this.shotX = this.aim.x + 35 * p;
        this.shotY = 140 + (this.landY - 140) * p;
      } else {
        this.shotX = 90 + (this.landX - 90) * p;
        this.shotY = 500 + (this.landY - 500) * p - Math.sin(p * Math.PI) * 220;
      }
      if (p >= 1) {
        this.lastQuality = clamp(100 - Math.hypot(this.landX - this.target.x, this.landY - this.target.y) * 0.55, 0, 100);
        this.shots.push(this.lastQuality);
        this.lastStamp = this.time;
        this.shotTime = -1;
        this.end(this.lastQuality, this.landX, this.landY);
      }
    }
  }
  end(score: number, x: number, y: number) {
    if (this.finished) return;
    this.finished = true;
    this.result = { score: clamp(Math.round(score), 0, 100), x: clamp(x, 50, 950), y: clamp(y, 240, 570), collisions: this.collisions };
  }
}
