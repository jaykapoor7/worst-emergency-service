import { useEffect, useRef } from "react";
import type { Emergency, Outcome, World as WorldState } from "./model";
import type { Operation } from "./operation";
import { render } from "./render";
import { play } from "./audio";
export type Hud = {
  time: number;
  started: boolean;
  shots: number;
  pickups: number;
  goal: boolean;
};
export default function World({
  world,
  event,
  operation,
  onFinish,
  onHud,
  onSecret,
  celebrate,
}: {
  world: WorldState;
  event: Emergency;
  operation: Operation | null;
  onFinish: (o: Outcome) => void;
  onHud: (h: Hud) => void;
  onSecret: () => void;
  celebrate: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef({
    world,
    event,
    operation,
    onFinish,
    onHud,
    onSecret,
    celebrate,
  });
  latest.current = {
    world,
    event,
    operation,
    onFinish,
    onHud,
    onSecret,
    celebrate,
  };
  useEffect(() => {
    if (operation) {
      canvas.current?.focus({ preventScroll: true });
      if (window.innerWidth < 760)
        canvas.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
          block: "center",
        });
    }
  }, [operation]);
  useEffect(() => {
    const node = canvas.current!,
      c = node.getContext("2d")!;
    let id = 0,
      last = performance.now(),
      hudAt = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resize = () => {
      const width = node.clientWidth,
        dpr = Math.min(devicePixelRatio || 1, 2);
      node.width = Math.round(width * dpr);
      node.height = Math.round(width * 0.64 * dpr);
      c.setTransform((width * dpr) / 1000, 0, 0, (width * dpr) / 1000, 0, 0);
    };
    const obs = new ResizeObserver(resize);
    obs.observe(node);
    resize();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = latest.current;
      if (!document.hidden) {
        if (p.operation) {
          const before = p.operation.shots.length;
          if (!p.operation.finished) p.operation.tick(dt);
          else p.operation.settle += dt;
          if (p.operation.shots.length !== before) play("stamp");
          if (
            p.operation.finished &&
            p.operation.result &&
            p.operation.settle > 1.05
          )
            p.onFinish(p.operation.result);
          else if (now - hudAt > 100) {
            p.onHud({
              time: p.operation.time,
              started: p.operation.started,
              shots: p.operation.shots.length,
              pickups: p.operation.pickup.size,
              goal: p.operation.goal,
            });
            hudAt = now;
          }
        }
        render(
          c,
          p.world,
          p.event,
          now / 1000,
          p.operation,
          reduced.matches,
          p.celebrate,
        );
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(id);
      obs.disconnect();
    };
  }, []);
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - b.left) / b.width) * 1000,
      y: ((e.clientY - b.top) / b.height) * 640,
    };
  };
  return (
    <canvas
      ref={canvas}
      tabIndex={operation ? 0 : -1}
      role={operation ? "application" : "img"}
      aria-label={
        operation
          ? "Interactive rescue operation. Use the pointer or arrow keys and Space."
          : "Bellwether, an animated miniature town. Your decisions remain visible here."
      }
      onPointerDown={(e) => {
        const p = point(e);
        if (!operation) {
          if (Math.hypot(p.x - 520, p.y - 360) < 35) onSecret();
          return;
        }
        e.currentTarget.setPointerCapture(e.pointerId);
        operation.held = true;
        if (operation.kind !== "timing") operation.point(p.x, p.y);
      }}
      onPointerMove={(e) => {
        if (
          operation?.held &&
          operation.shotTime < 0 &&
          operation.kind !== "timing"
        ) {
          const p = point(e);
          operation.point(p.x, p.y);
        }
      }}
      onPointerUp={() => {
        if (!operation?.held) return;
        operation.held = false;
        if (["rescue", "launch"].includes(operation.kind)) operation.act();
      }}
      onPointerCancel={() => {
        if (operation) operation.held = false;
      }}
      onKeyDown={(e) => {
        if (!operation) return;
        if (
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(
            e.key,
          )
        ) {
          e.preventDefault();
          operation.start();
          operation.keys.add(e.key);
          if (e.key === " " && !e.repeat) operation.act();
        }
      }}
      onKeyUp={(e) => operation?.keys.delete(e.key)}
      onBlur={() => operation?.keys.clear()}
    />
  );
}
