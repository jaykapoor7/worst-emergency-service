import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const dom = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { url: "https://game.test", pretendToBeVisual: true },
);
const win = dom.window;
for (const key of [
  "window",
  "document",
  "localStorage",
  "HTMLElement",
  "HTMLCanvasElement",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
])
  Object.defineProperty(globalThis, key, {
    value: key === "window" ? win : win[key],
    configurable: true,
  });
Object.defineProperty(globalThis, "navigator", {
  value: win.navigator,
  configurable: true,
});
Object.defineProperty(globalThis, "devicePixelRatio", {
  value: 1,
  configurable: true,
});
let width = 850;
win.matchMedia = () => ({
  matches: false,
  addListener() {},
  removeListener() {},
});
win.HTMLElement.prototype.scrollIntoView = () => {};
win.HTMLCanvasElement.prototype.setPointerCapture = () => {};
const fakeCtx = new Proxy(
  {},
  {
    get: (_, key) => {
      if (key === "canvas") return {};
      return () => {};
    },
    set: () => true,
  },
);
win.HTMLCanvasElement.prototype.getContext = () => fakeCtx;
Object.defineProperty(win.HTMLCanvasElement.prototype, "clientWidth", {
  get: () => width,
});
win.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
  left: 0,
  top: 0,
  width,
  height: width * 0.64,
  right: width,
  bottom: width * 0.64,
});
class RO {
  observe() {}
  disconnect() {}
}
Object.defineProperty(globalThis, "ResizeObserver", {
  value: RO,
  configurable: true,
});
let now = performance.now(),
  nextId = 1;
const frames = new Map<number, FrameRequestCallback>();
Object.defineProperty(globalThis, "requestAnimationFrame", {
  value: (fn: FrameRequestCallback) => {
    const id = nextId++;
    frames.set(id, fn);
    return id;
  },
  configurable: true,
});
Object.defineProperty(globalThis, "cancelAnimationFrame", {
  value: (id: number) => frames.delete(id),
  configurable: true,
});
Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
  value: true,
  configurable: true,
});
const React = await import("react");
Object.defineProperty(globalThis, "React", {
  value: React,
  configurable: true,
});
const { act } = React;
const { createRoot } = await import("react-dom/client");
const { default: App } = await import("../src/App");
const { SAVE_KEY } = await import("../src/model");
const { getEvent } = await import("../src/events");
let root = createRoot(document.getElementById("root")!);
const mount = async () => {
  await act(async () => {
    root.render(<App />);
  });
};
await mount();
const state = () => JSON.parse(localStorage.getItem(SAVE_KEY)!);
const click = async (label: string) => {
  const button = [...document.querySelectorAll("button")].find(
    (b) =>
      (b.textContent || "").includes(label) ||
      b.getAttribute("aria-label") === label,
  );
  assert.ok(button, `missing ${label}`);
  await act(async () => {
    button.click();
  });
};
const step = async (seconds: number) => {
  for (let t = 0; t < seconds; t += 0.05) {
    await act(async () => {
      now += 50;
      const current = [...frames.values()];
      frames.clear();
      for (const f of current) f(now);
    });
  }
};
const pointer = async (x: number, y: number, type = "pointerdown") => {
  const canvas = document.querySelector("canvas")!;
  await act(async () => {
    canvas.dispatchEvent(
      new win.MouseEvent(type, {
        bubbles: true,
        clientX: (x / 1000) * width,
        clientY: (y / 1000) * width,
        button: 0,
      }),
    );
  });
};
assert.match(document.body.textContent!, /My cat is stuck/);
const seen = new Set<string>();
for (let i = 0; i < 30; i++) {
  const s = state(),
    e = getEvent(s.eventId),
    r = e.responses[i % 3];
  seen.add(r.mechanic);
  await click(r.label);
  assert.equal(
    document.querySelector("canvas")?.getAttribute("role"),
    "application",
  );
  if (i === 0) {
    const before = state();
    assert.equal(before.phase, "call");
    await act(async () => {
      root.unmount();
    });
    root = createRoot(document.getElementById("root")!);
    await mount();
    assert.equal(state().eventId, "cat");
    assert.match(document.body.textContent!, /My cat is stuck/);
    await click(r.label);
  }
  if (r.mechanic === "magnet") {
    for (const [x, y] of [
      [270, 460],
      [510, 445],
      [750, 500],
    ]) {
      await pointer(x, y);
      await step(3);
    }
    await pointer(820, 525, "pointermove");
    await step(5);
  } else if (r.mechanic === "steer") {
    await pointer(...e.location);
    await step(14.5);
  } else if (r.mechanic === "timing") {
    for (let n = 0; n < 3; n++) {
      await click("AUTHORIZE");
      await step(1);
    }
    await step(12);
  } else {
    const n = r.mechanic === "launch" ? 2 : 3;
    for (let j = 0; j < n; j++) {
      await pointer(
        e.location[0] - (r.mechanic === "launch" ? 65 : 35),
        e.location[1],
      );
      await pointer(
        e.location[0] - (r.mechanic === "launch" ? 65 : 35),
        e.location[1],
        "pointerup",
      );
      await step(1.5);
    }
    await step(11);
  }
  assert.equal(state().phase, "result", `no result for ${i}:${r.mechanic}`);
  assert.equal(state().world.count, i + 1);
  await click("ANSWER NEXT CALL");
  if (state().phase === "promotion") {
    await click(
      i === 24 ? "TAKE THE PRESIDENTIAL CALL" : "RETURN TO YOUR DESK",
    );
  }
  assert.equal(state().phase, "call");
  if (i === 24) assert.equal(state().eventId, "moon");
}
assert.equal(seen.size, 5);
await click("Mute sound");
assert.equal(state().world.muted, true);
await click("Open case history");
assert.equal(document.querySelectorAll(".history li").length, 30);
await click("Close dialog");
await click("New game");
await click("KEEP MY TOWN");
assert.equal(state().world.count, 30);
await click("New game");
await click("NEW GAME");
assert.equal(state().world.count, 0);
assert.equal(state().world.muted, true);
width = 340;
await act(async () => {
  root.unmount();
});
root = createRoot(document.getElementById("root")!);
Object.defineProperty(win, "innerWidth", { value: 390, configurable: true });
await mount();
await click("Deploy a dinosaur");
await pointer(250, 340);
await step(14);
assert.equal(state().world.count, 1);
assert.equal(state().world.effects.dinosaur, 1);
await click("New game");
await click("NEW GAME");
await click("Deploy a dinosaur");
const keyboardCanvas = document.querySelector("canvas")!;
for (const [key, seconds] of [
  ["ArrowRight", 0.65],
  ["ArrowUp", 0.65],
] as const) {
  await act(async () =>
    keyboardCanvas.dispatchEvent(
      new win.KeyboardEvent("keydown", { key, bubbles: true }),
    ),
  );
  await step(seconds);
  await act(async () =>
    keyboardCanvas.dispatchEvent(
      new win.KeyboardEvent("keyup", { key, bubbles: true }),
    ),
  );
}
await step(9);
assert.equal(state().world.count, 1);
assert.equal(state().world.effects.dinosaur, 1);
await act(async () => root.unmount());
console.log(
  "PASS: actual React UI mounted; 30 pointer-driven operations, all five mechanics, promotion screens, safe challenge refresh, mute, case history, reset cancellation/reset, and narrow-canvas pointer coordinates. DOM simulation only; no browser layout/audio claim.",
);
