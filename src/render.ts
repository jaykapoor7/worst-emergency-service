import type { World, Emergency } from "./model";
import type { Operation } from "./operation";
type C = CanvasRenderingContext2D;
const ink = "#35493e",
  cream = "#fff1d1";
function path(c: C, points: number[][], fill: string, stroke = ink, width = 2) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.lineJoin = "round";
    c.stroke();
  }
}
function line(c: C, points: number[][], color = ink, width = 2) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.stroke();
}
function ellipse(
  c: C,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
  stroke = "",
) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = color;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = 2;
    c.stroke();
  }
}
function rect(
  c: C,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  r = 0,
  stroke = "",
) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = color;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = 2;
    c.stroke();
  }
}
function text(
  c: C,
  s: string,
  x: number,
  y: number,
  size = 9,
  color = ink,
  align: CanvasTextAlign = "center",
) {
  c.font = `600 ${size}px 'Courier New',monospace`;
  c.textAlign = align;
  c.fillStyle = color;
  c.fillText(s, x, y);
}
export function tree(c: C, x: number, y: number, s = 1, cat = false) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  ellipse(c, 9, 5, 27, 9, "#63826924");
  path(
    c,
    [
      [-5, 0],
      [-3, -62],
      [6, -62],
      [5, 0],
    ],
    "#a07a54",
  );
  line(
    c,
    [
      [0, -27],
      [-18, -51],
    ],
    "#806448",
    4,
  );
  ellipse(c, -17, -59, 25, 27, "#759c72", ink);
  ellipse(c, 16, -64, 27, 30, "#85ac79", ink);
  ellipse(c, 0, -83, 28, 27, "#91b47e", ink);
  line(
    c,
    [
      [-10, -90],
      [-2, -94],
      [8, -90],
    ],
    "#b7cb92",
    2,
  );
  if (cat) {
    path(
      c,
      [
        [18, -70],
        [16, -88],
        [22, -85],
        [27, -89],
        [30, -76],
      ],
      "#deae65",
    );
    ellipse(c, 23, -72, 9, 8, "#deae65", ink);
    ellipse(c, 21, -77, 1, 1, ink);
    ellipse(c, 27, -77, 1, 1, ink);
    line(
      c,
      [
        [29, -68],
        [39, -63],
        [41, -73],
      ],
      "#a7794c",
      3,
    );
  }
  c.restore();
}
function building(
  c: C,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  roof: string,
  label = "",
  special = "",
) {
  c.save();
  c.translate(x, y);
  ellipse(c, 16, 8, w * 0.67, 17, "#3f665228");
  path(
    c,
    [
      [-w / 2, 0],
      [w / 2, 0],
      [w / 2, -h],
      [-w / 2, -h],
    ],
    color,
  );
  path(
    c,
    [
      [w / 2, -h],
      [w / 2 + 25, -h - 14],
      [w / 2 + 25, -14],
      [w / 2, 0],
    ],
    "#a9ae95",
  );
  path(
    c,
    [
      [-w / 2 - 7, -h],
      [-8, -h - 37],
      [w / 2 + 33, -h - 14],
      [w / 2 + 7, -h],
    ],
    roof,
  );
  path(
    c,
    [
      [-w / 2 - 7, -h],
      [-8, -h - 37],
      [w / 2 + 7, -h],
    ],
    roof,
  );
  line(
    c,
    [
      [-w / 2 - 2, -h + 6],
      [w / 2 - 1, -h + 6],
    ],
    "#fff1cf77",
    3,
  );
  for (let i = 0; i < 3; i++)
    line(
      c,
      [
        [-w / 2 + 16 + i * 17, -h - 5],
        [-9 + i * 12, -h - 30],
      ],
      "#263c3333",
      1,
    );
  if (special === "hall") {
    path(
      c,
      [
        [-w / 2 - 6, -h + 3],
        [0, -h - 28],
        [w / 2 + 6, -h + 3],
      ],
      cream,
    );
    ellipse(c, 0, -h - 8, 8, 8, "#e7c378", ink);
    for (const dx of [-w * 0.37, -w * 0.17, w * 0.17, w * 0.37]) {
      rect(c, dx - 4, -h + 15, 8, h - 21, "#eee5cb", 1, ink);
      rect(c, dx - 7, -h + 11, 14, 5, cream, 1, ink);
    }
    rect(c, -w / 2 - 7, 0, w + 14, 7, "#b7b69a", 1, ink);
    rect(c, -w / 2 - 13, 7, w + 26, 6, "#d3cdb2", 1, ink);
    rect(c, -15, -39, 30, 39, "#7d7261", 13, ink);
    text(c, "TOWN HALL", 0, -h + 20, 9);
    line(
      c,
      [
        [0, -h - 30],
        [0, -h - 63],
      ],
      ink,
      2,
    );
    path(
      c,
      [
        [1, -h - 62],
        [27, -h - 55],
        [1, -h - 46],
      ],
      "#dc7255",
    );
  } else if (special === "fire") {
    rect(c, -w / 2 + 9, -h + 32, w * 0.46, h - 34, "#665f51", 4, ink);
    for (let i = 0; i < 5; i++)
      line(
        c,
        [
          [-w / 2 + 11, -h + 39 + i * 9],
          [-w / 2 + w * 0.46 + 7, -h + 39 + i * 9],
        ],
        "#aaa58c",
        1,
      );
    rect(c, 17, -35, 18, 35, "#717e69", 2, ink);
    text(c, "FIRE & RESCUE", 0, -h + 20, 8, cream);
  } else {
    const n = w > 90 ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const dx = -w / 2 + 14 + (i * (w - 22)) / n;
      rect(c, dx, -h + 13, 14, 19, "#d5e3d0", 2, ink);
      line(
        c,
        [
          [dx + 7, -h + 14],
          [dx + 7, -h + 31],
        ],
        "#6f8470",
        1,
      );
      line(
        c,
        [
          [dx + 1, -h + 22],
          [dx + 13, -h + 22],
        ],
        "#6f8470",
        1,
      );
    }
    rect(c, -10, -33, 21, 33, "#7b7760", 3, ink);
    ellipse(c, 5, -15, 1.5, 1.5, "#f4dc9b");
    if (label) {
      rect(c, -w / 2 + 7, -h + 38, w - 14, 15, "#fff0cf", 2, ink);
      text(c, label, 0, -h + 49, label.length > 10 ? 7 : 8);
    }
  }
  if (special === "clinic") {
    rect(c, -8, -h - 16, 16, 25, "#e9e9d4", 2);
    rect(c, -3, -h - 11, 6, 16, "#ce6852");
    rect(c, -8, -h - 6, 16, 6, "#ce6852");
  }
  rect(c, -w / 2 + 12, -h - 25, 10, 23, "#9b8768", 1, ink);
  c.restore();
}
export function person(
  c: C,
  x: number,
  y: number,
  t: number,
  color = "#d77e5f",
  scale = 1,
  panic = false,
) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  const gait = Math.sin(t * (panic ? 15 : 7));
  ellipse(c, 1, 3, 7, 3, "#32574422");
  line(
    c,
    [
      [0, -8],
      [-3 - gait * 2, 0],
    ],
    ink,
    2.5,
  );
  line(
    c,
    [
      [1, -8],
      [4 + gait * 2, 0],
    ],
    ink,
    2.5,
  );
  path(
    c,
    [
      [-4, -21],
      [4, -21],
      [6, -8],
      [-5, -8],
    ],
    color,
    "",
    0,
  );
  line(
    c,
    [
      [-3, -18],
      [-8 - gait * 2, -12 - (panic ? 15 : 0)],
    ],
    color,
    3,
  );
  line(
    c,
    [
      [4, -18],
      [9 + gait * 2, -14 - (panic ? 13 : 0)],
    ],
    color,
    3,
  );
  ellipse(c, 0, -27, 5.5, 6.5, "#e8b48a", ink);
  path(
    c,
    [
      [-5, -29],
      [-4, -34],
      [2, -35],
      [5, -31],
      [4, -29],
    ],
    "#574b3a",
    "",
    0,
  );
  ellipse(c, 2, -27, 1, 1, ink);
  c.restore();
}
export function dinosaur(
  c: C,
  x: number,
  y: number,
  t: number,
  s = 1,
  swim = false,
) {
  c.save();
  c.translate(x, y + Math.sin(t * 3) * 2);
  c.scale(s, s);
  ellipse(c, 0, 3, 50, 13, "#3e62492b");
  path(
    c,
    [
      [-42, -29],
      [-72, -40],
      [-87, -65],
      [-64, -49],
      [-31, -48],
    ],
    "#86a37b",
  );
  ellipse(c, -3, -30, 43, 27, "#83a675", ink);
  path(
    c,
    [
      [17, -43],
      [35, -85],
      [42, -108],
      [68, -105],
      [78, -93],
      [70, -80],
      [53, -79],
      [41, -31],
    ],
    "#8aaf7d",
  );
  ellipse(c, 59, -99, 4, 5, cream);
  ellipse(c, 60, -100, 1.8, 2.7, ink);
  line(
    c,
    [
      [70, -87],
      [59, -86],
    ],
    ink,
    2,
  );
  line(
    c,
    [
      [-26, -16],
      [-25 + Math.sin(t * 6) * 4, 0],
    ],
    "#5a805b",
    11,
  );
  line(
    c,
    [
      [15, -14],
      [19 - Math.sin(t * 6) * 4, 0],
    ],
    "#5a805b",
    11,
  );
  line(
    c,
    [
      [36, -52],
      [47, -45],
      [50, -51],
    ],
    "#5a805b",
    4,
  );
  for (let i = 0; i < 4; i++)
    path(
      c,
      [
        [-37 + i * 14, -49 - i],
        [-30 + i * 14, -61 - i],
        [-23 + i * 14, -50 - i],
      ],
      "#b3bf81",
      ink,
      1,
    );
  if (swim) {
    ellipse(c, 1, -4, 57, 11, "#78bcc4aa");
    line(
      c,
      [
        [-61, 0],
        [-32, 2],
        [-10, 0],
        [16, 2],
        [44, 0],
        [62, 2],
      ],
      "#c6e5d5",
      2,
    );
  }
  c.restore();
}
function bird(c: C, x: number, y: number, t: number, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  ellipse(c, 0, -5, 9, 6, "#72828b", ink);
  ellipse(c, 6, -12, 5, 6, "#7d9293", ink);
  path(
    c,
    [
      [10, -13],
      [16, -10],
      [10, -9],
    ],
    "#d6a65b",
    ink,
    1,
  );
  ellipse(c, 7, -13, 1, 1, ink);
  line(
    c,
    [
      [-4, 0],
      [-4, 4],
      [4, 0],
      [4, 4],
    ],
    "#ba8752",
    1,
  );
  line(
    c,
    [
      [-3, -6],
      [2 + Math.sin(t * 4), -4],
    ],
    "#b3bfb0",
    2,
  );
  c.restore();
}
function duck(c: C, x: number, y: number, t: number) {
  ellipse(c, x, y, 10, 6, "#e6d5a5", ink);
  ellipse(c, x + 6, y - 8, 5, 6, "#66886b", ink);
  path(
    c,
    [
      [x + 10, y - 9],
      [x + 17, y - 6],
      [x + 10, y - 5],
    ],
    "#dba04f",
    ink,
    1,
  );
  line(
    c,
    [
      [x - 13, y + 7],
      [x + Math.sin(t) * 5, y + 8],
      [x + 14, y + 7],
    ],
    "#d8e4c5",
    1,
  );
}
function car(c: C, x: number, y: number, color: string, dir = 1) {
  c.save();
  c.translate(x, y);
  c.scale(dir, 1);
  ellipse(c, 0, 3, 27, 6, "#34553c22");
  rect(c, -25, -19, 50, 19, color, 6, ink);
  path(
    c,
    [
      [-15, -19],
      [-7, -30],
      [12, -30],
      [22, -19],
    ],
    color,
  );
  path(
    c,
    [
      [-9, -21],
      [-4, -27],
      [9, -27],
      [13, -21],
    ],
    "#d6e9d1",
    ink,
    1,
  );
  ellipse(c, -13, 1, 6, 6, "#405044", ink);
  ellipse(c, 16, 1, 6, 6, "#405044", ink);
  ellipse(c, -13, 1, 2, 2, "#d0cbaa");
  ellipse(c, 16, 1, 2, 2, "#d0cbaa");
  rect(c, 21, -14, 5, 5, "#ffe9a4", 1);
  c.restore();
}
export function helicopter(c: C, x: number, y: number, t: number) {
  c.save();
  c.translate(x, y);
  line(
    c,
    [
      [-25, -8],
      [-75, -16],
      [-84, -35],
    ],
    "#586b55",
    6,
  );
  ellipse(c, 0, -15, 35, 22, "#e7b95e", ink);
  path(
    c,
    [
      [8, -33],
      [23, -29],
      [31, -14],
      [8, -14],
    ],
    "#b6d9d5",
  );
  line(
    c,
    [
      [-20, 7],
      [-23, 16],
      [29, 16],
      [22, 7],
    ],
    ink,
    3,
  );
  line(
    c,
    [
      [0, -37],
      [0, -45],
    ],
    ink,
    3,
  );
  line(
    c,
    [
      [-60 * Math.cos(t * 30), -45],
      [60 * Math.cos(t * 30), -45],
    ],
    ink,
    4,
  );
  line(
    c,
    [
      [-72, -25],
      [-72, 0],
    ],
    ink,
    2,
  );
  c.restore();
}
function magnet(c: C, x: number, y: number) {
  c.save();
  c.translate(x, y);
  c.beginPath();
  c.moveTo(-23, -33);
  c.lineTo(-23, -3);
  c.bezierCurveTo(-23, 33, 23, 33, 23, -3);
  c.lineTo(23, -33);
  c.lineTo(8, -33);
  c.lineTo(8, -3);
  c.bezierCurveTo(8, 11, -8, 11, -8, -3);
  c.lineTo(-8, -33);
  c.closePath();
  c.fillStyle = "#ce604b";
  c.fill();
  c.strokeStyle = ink;
  c.lineWidth = 2;
  c.stroke();
  rect(c, -23, -33, 15, 12, cream, 0, ink);
  rect(c, 8, -33, 15, 12, cream, 0, ink);
  c.restore();
}
function ufo(c: C, x: number, y: number, t: number) {
  c.save();
  c.translate(x, y + Math.sin(t * 2) * 5);
  ellipse(c, 0, 2, 47, 12, "#7c8e9a", ink);
  c.beginPath();
  c.ellipse(0, -4, 27, 27, 0, Math.PI, Math.PI * 2);
  c.fillStyle = "#b9dad0";
  c.fill();
  c.stroke();
  ellipse(c, 0, -11, 9, 10, "#7ba17c", ink);
  ellipse(c, -4, -12, 2, 3, ink);
  ellipse(c, 4, -12, 2, 3, ink);
  for (let i = 0; i < 5; i++)
    ellipse(c, -30 + i * 15, 4, 3, 2, i % 2 ? "#e9b67a" : "#e8e9ac");
  c.restore();
}
export function tool(
  c: C,
  name: string,
  x: number,
  y: number,
  t: number,
  scale = 1,
) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  if (name === "dinosaur") dinosaur(c, 0, 0, t, 0.65);
  else if (name === "helicopter" || name === "firefighter") {
    if (name === "helicopter") helicopter(c, 0, 0, t);
    else {
      person(c, 0, 0, t, "#cc6651", 1.5);
      rect(c, -9, -46, 18, 5, "#edc266", 2, ink);
      rect(c, -6, -51, 12, 8, "#edc266", 3, ink);
    }
  } else if (name === "truck" || name === "car") car(c, 0, 0, "#ebc572");
  else if (name === "band") {
    person(c, 0, 0, t, "#9b6680", 1.4);
    ellipse(c, 15, -23, 9, 9, "#cfac60", ink);
    line(
      c,
      [
        [6, -23],
        [15, -23],
      ],
      "#cfac60",
      5,
    );
  } else if (name === "ufo") ufo(c, 0, 0, t);
  else if (name === "boat") {
    path(
      c,
      [
        [-35, -12],
        [35, -12],
        [20, 7],
        [-23, 7],
      ],
      "#d5a971",
    );
    line(
      c,
      [
        [0, -12],
        [0, -48],
      ],
      ink,
      2,
    );
    path(
      c,
      [
        [2, -47],
        [27, -18],
        [2, -18],
      ],
      cream,
    );
    duck(c, -14, -18, t);
  } else if (name === "magnet") magnet(c, 0, 0);
  else if (name === "cone") {
    path(
      c,
      [
        [-21, 6],
        [0, -41],
        [21, 6],
      ],
      "#df7b50",
    );
    rect(c, -26, 4, 52, 7, "#df7b50", 2, ink);
    path(
      c,
      [
        [-10, -19],
        [10, -19],
        [14, -10],
        [-14, -10],
      ],
      cream,
      "",
      0,
    );
  } else if (name === "bread") {
    rect(c, -30, -18, 60, 22, "#ce9b56", 11, ink);
    for (let i = 0; i < 4; i++)
      line(
        c,
        [
          [-20 + i * 14, -14],
          [-15 + i * 14, -6],
        ],
        "#f8d897",
        3,
      );
  } else if (name === "ladder") {
    for (let i = 0; i < 6; i++)
      line(
        c,
        [
          [-12, -i * 10],
          [12, -i * 10],
        ],
        "#bfa065",
        3,
      );
    line(
      c,
      [
        [-15, 7],
        [-15, -65],
      ],
      ink,
      3,
    );
    line(
      c,
      [
        [15, 7],
        [15, -65],
      ],
      ink,
      3,
    );
  } else if (name === "stamp") {
    rect(c, -18, -12, 36, 15, "#c65c46", 3, ink);
    rect(c, -7, -31, 14, 21, "#9e7c52", 3, ink);
    ellipse(c, 0, -33, 13, 6, "#9e7c52", ink);
  } else if (name === "fan") {
    rect(c, -5, -10, 10, 27, "#7a9281", 2, ink);
    ellipse(c, 0, -25, 25, 25, "#d5d9ba", ink);
    for (let i = 0; i < 3; i++) {
      c.save();
      c.translate(0, -25);
      c.rotate(t * 9 + (i * Math.PI * 2) / 3);
      ellipse(c, 0, -11, 6, 13, "#829a82", ink);
      c.restore();
    }
    ellipse(c, 0, -25, 5, 5, "#d5b778", ink);
  } else if (name === "clock") {
    ellipse(c, 0, -17, 24, 24, cream, ink);
    line(
      c,
      [
        [0, -33],
        [0, -17],
        [14, -10],
      ],
      ink,
      3,
    );
  } else {
    rect(c, -25, -31, 50, 35, "#c09c71", 3, ink);
    rect(c, -5, -31, 10, 35, "#f0d99a");
    line(
      c,
      [
        [-25, -13],
        [25, -13],
      ],
      "#f0d99a",
      5,
    );
    text(c, name === "phone" ? "RING" : "URGENT", 0, -7, 7);
  }
  c.restore();
}
export function render(
  c: C,
  w: World,
  e: Emergency,
  time: number,
  op: Operation | null,
  reduced = false,
  celebrate = false,
) {
  const t = reduced || celebrate ? 0 : time;
  const { effects: fx } = w;
  c.clearRect(0, 0, 1000, 640);
  rect(c, 0, 0, 1000, 640, "#c8dfd9");
  // The town is an illustrated stage: distant hills, streets, individual architecture.
  ellipse(c, 855, 72, 34, 34, "#efc66e");
  path(
    c,
    [
      [0, 175],
      [100, 101],
      [180, 126],
      [275, 92],
      [380, 163],
      [470, 115],
      [590, 166],
      [720, 104],
      [835, 163],
      [1000, 95],
      [1000, 280],
      [0, 280],
    ],
    "#9ebba3",
    "",
  );
  path(
    c,
    [
      [0, 196],
      [140, 157],
      [285, 190],
      [440, 151],
      [590, 188],
      [780, 145],
      [1000, 190],
      [1000, 640],
      [0, 640],
    ],
    "#b9ce9d",
    "",
  );
  for (let i = 0; i < 4; i++) {
    const x = ((i * 303 + t * 6) % 1300) - 130;
    ellipse(c, x, 61 + (i % 2) * 31, 40, 9, "#f1ebce");
    ellipse(c, x - 14, 56 + (i % 2) * 31, 17, 14, "#f1ebce");
    ellipse(c, x + 9, 52 + (i % 2) * 31, 22, 17, "#f1ebce");
  }
  // Grass tufts, flower clusters and garden paths are seeded, not allocated each frame.
  for (let i = 0; i < 100; i++) {
    const x = (i * 173) % 990,
      y = 220 + ((i * 97) % 405);
    line(
      c,
      [
        [x - 3, y + 2],
        [x, y - 2],
        [x + 3, y + 2],
      ],
      "#7e9c6d66",
      1,
    );
    if (i % 8 === 0) {
      ellipse(c, x + 6, y - 2, 2, 2, "#e4c974");
      ellipse(c, x - 5, y, 2, 2, "#f1e5bf");
    }
  }
  path(
    c,
    [
      [0, 402],
      [1000, 429],
      [1000, 496],
      [0, 469],
    ],
    "#d6ccb0",
    "",
  );
  path(
    c,
    [
      [0, 414],
      [1000, 441],
      [1000, 482],
      [0, 455],
    ],
    "#8f9886",
    "",
  );
  line(
    c,
    [
      [0, 435],
      [1000, 462],
    ],
    "#e7deb8",
    2,
  );
  path(
    c,
    [
      [445, 200],
      [483, 200],
      [558, 640],
      [511, 640],
    ],
    "#d6ccb0",
    "",
  );
  path(
    c,
    [
      [453, 200],
      [475, 200],
      [547, 640],
      [522, 640],
    ],
    "#8f9886",
    "",
  );
  for (let i = 0; i < 12; i++)
    line(
      c,
      [
        [453 + i * 6, 220 + i * 34],
        [456 + i * 6, 232 + i * 34],
      ],
      "#e7deb8",
      2,
    );
  for (let i = 0; i < 6; i++) rect(c, 444 + i * 13, 419, 7, 43, "#eee4c2", 0);
  // Creek and a little stone bridge.
  c.beginPath();
  c.moveTo(1000, 280);
  c.bezierCurveTo(860, 320, 935, 480, 840, 640);
  c.lineTo(1000, 640);
  c.closePath();
  c.fillStyle = "#7aada9";
  c.fill();
  for (let i = 0; i < 18; i++) {
    const x = 950 + (i % 3) * 18,
      y = 315 + i * 17;
    line(
      c,
      [
        [x + Math.sin(t + i) * 3, y],
        [x + 20, y],
      ],
      "#c0d6bd",
      1,
    );
  }
  path(
    c,
    [
      [868, 436],
      [960, 438],
      [951, 482],
      [854, 479],
    ],
    "#b5ad92",
  );
  line(
    c,
    [
      [865, 434],
      [958, 436],
    ],
    "#f0e3c2",
    6,
  );
  line(
    c,
    [
      [853, 479],
      [950, 482],
    ],
    "#e4d9b9",
    5,
  );
  tree(c, 54, 271, 1.1);
  tree(c, 902, 274, 0.85);
  tree(c, 670, 247, 0.72);
  tree(c, 390, 236, 0.68);
  tree(c, 95, 560, 0.8);
  tree(c, 820, 578, 0.8);
  building(c, 140, 328, 86, 68, "#bdc0a4", "#667f72", "POLICE");
  if (!w.flags.houseChewed)
    building(c, 350, 318, 87, 74, "#dfb16f", "#c77455", "BELL HOUSE");
  else {
    path(
      c,
      [
        [306, 318],
        [393, 318],
        [418, 304],
        [330, 304],
      ],
      "#c9b28b",
    );
    rect(c, 311, 290, 25, 28, "#dfb16f", 0, ink);
    path(
      c,
      [
        [306, 290],
        [318, 270],
        [336, 283],
        [339, 292],
      ],
      "#c77455",
    );
    line(
      c,
      [
        [345, 311],
        [369, 296],
        [391, 308],
      ],
      "#937853",
      5,
    );
    text(c, "OPEN PLAN", 365, 338, 8, "#7d6b4e");
  }
  building(c, 507, 335, 124, 91, "#e8d9b5", "#b6644f", "", "hall");
  building(c, 760, 315, 108, 76, "#d4d9bd", "#7c978a", "HOSPITAL", "clinic");
  building(c, 890, 382, 65, 65, "#b5b5c0", "#85849b", "POST");
  if (!w.flags.treeRemoved) tree(c, 246, 352, 1.1, !w.catSaved);
  else {
    rect(c, 242, 340, 12, 12, "#a17c56", 2, ink);
    ellipse(c, 248, 340, 8, 3, "#d0b47d", ink);
    line(
      c,
      [
        [229, 350],
        [211, 340],
        [205, 346],
      ],
      "#8b774f",
      4,
    );
  }
  if (!w.catSaved) {
    text(c, "mrrp.", 269, 244, 10);
    line(
      c,
      [
        [223, 357],
        [223, 388],
      ],
      "#a68b65",
      2,
    );
    rect(c, 207, 358, 32, 5, "#d4b371", 1, ink);
  }
  building(c, 136, 536, 105, 65, "#c66f56", "#685e55", "", "fire");
  if (!w.flags.bakeryOpenAir)
    building(c, 346, 552, 93, 65, "#e7c17d", "#8a7c68", "BAKERY");
  else {
    rect(c, 300, 514, 93, 38, "#e7c17d", 0, ink);
    text(c, "ALFRESCO BAKERY", 346, 529, 7);
    rect(c, 308, 537, 77, 15, "#a2916c", 0, ink);
    for (let i = 0; i < 4; i++) tool(c, "bread", 319 + i * 19, 545, t, 0.25);
  }
  building(c, 660, 558, 94, 64, "#8ea69a", "#c27655", "CORNER SHOP");
  // Plaza, fountain, lampposts, benches, road signs.
  ellipse(c, 625, 371, 43, 19, "#d9cbae", ink);
  ellipse(c, 625, 365, 34, 13, "#8cbbb4", ink);
  rect(c, 621, 333, 8, 30, "#c6c5a5", 3, ink);
  ellipse(c, 625, 333, 13, 5, "#dce0bd", ink);
  line(
    c,
    [
      [625, 332],
      [625, 312],
    ],
    "#e8ecd1",
    3,
  );
  ellipse(c, 625 + Math.sin(t * 6) * 3, 313, 2, 4, "#e6edd3");
  for (const [x, y] of [
    [395, 380],
    [596, 405],
    [840, 408],
    [287, 575],
  ]) {
    line(
      c,
      [
        [x, y],
        [x, y - 48],
        [x + 9, y - 48],
      ],
      "#5d705a",
      3,
    );
    rect(c, x + 4, y - 57, 13, 13, "#f4e2a8", 4, ink);
  }
  for (const [x, y] of [
    [280, 376],
    [707, 388],
    [416, 580],
  ]) {
    rect(c, x - 17, y - 10, 35, 8, "#ab8a5b", 2, ink);
    line(
      c,
      [
        [x - 12, y - 2],
        [x - 12, y + 8],
      ],
      ink,
      2,
    );
    line(
      c,
      [
        [x + 12, y - 2],
        [x + 12, y + 8],
      ],
      ink,
      2,
    );
  }
  line(
    c,
    [
      [573, 414],
      [573, 387],
    ],
    ink,
    3,
  );
  rect(c, 557, 378, 32, 12, "#f1db9d", 3, ink);
  text(c, "SLOW", 573, 386, 6);
  line(
    c,
    [
      [422, 405],
      [422, 370],
    ],
    ink,
    2,
  );
  ellipse(c, 422, 366, 10, 10, "#c86a4e", ink);
  text(c, "STOP", 422, 369, 5, cream);
  if (!fx.magnet) {
    car(
      c,
      ((t * 28 + 150) % 1150) - 75,
      443 + (((t * 28 + 150) % 1150) / 1000) * 27,
      "#d76d50",
    );
    car(c, 1050 - ((t * 23 + 430) % 1150), 452, "#d2b967", -1);
  } else {
    for (let i = 0; i < Math.min(5, fx.magnet + 1); i++)
      car(
        c,
        790 + (i % 2) * 28,
        471 - Math.floor(i / 2) * 18,
        ["#d7b268", "#c66c56", "#879eab"][i % 3],
        i % 2 ? 1 : -1,
      );
    magnet(c, 830, 439);
  }
  car(c, 120, 545, "#c75e46");
  rect(c, 99, 524, 16, 4, "#f0d6a5", 1);
  car(c, 803, 330, "#eee4c6");
  rect(c, 799, 306, 7, 15, "#c96850");
  rect(c, 795, 310, 15, 6, "#c96850");
  // Citizens follow small routes and react to the accumulated world conditions.
  for (let i = 0; i < 20; i++) {
    const lane = i % 3,
      baseX = 65 + ((i * 137) % 830),
      baseY = lane === 0 ? 395 : lane === 1 ? 506 : 365;
    const x = baseX + Math.sin(t * (fx.dinosaur ? 0.85 : 0.24) + i * 3) * 25,
      y = baseY + Math.sin(i * 7) * 9;
    person(
      c,
      x,
      y,
      t + i,
      ["#b46f57", "#64877a", "#8b7d9b", "#b6a05d"][i % 4],
      0.75,
      !!fx.dinosaur && i % 3 === 0,
    );
  }
  person(c, 520, 372, t, "#536c7d", 1.05);
  rect(c, 513, 339, 14, 4, "#3d4c41", 1);
  rect(c, 516, 331, 8, 11, "#3d4c41", 1);
  if (w.count > 0) {
    text(c, w.damage > 5 ? "GREAT WORK!" : "APPROVED", 544, 345, 7, "#707a5d");
  }
  // A tiny dog, a mailbox, a suspiciously patient cat.
  ellipse(c, 404, 394, 9, 4, "#b88859", ink);
  ellipse(c, 412, 389, 4, 4, "#b88859", ink);
  line(
    c,
    [
      [398, 396],
      [397, 401],
      [407, 397],
      [408, 402],
      [396, 392],
      [391, 386],
    ],
    "#8a6946",
    2,
  );
  rect(c, 713, 403, 15, 15, "#748d96", 5, ink);
  line(
    c,
    [
      [721, 418],
      [721, 429],
    ],
    ink,
    3,
  );
  // Persistent effects and cross-system visual callbacks.
  if (fx.flood) {
    const depth = fx.flood * 6;
    c.beginPath();
    c.moveTo(0, 568 - depth);
    for (let x = 0; x <= 1000; x += 20)
      c.lineTo(x, 568 - depth + Math.sin(x * 0.025 + t * 2) * 4);
    c.lineTo(1000, 640);
    c.lineTo(0, 640);
    c.closePath();
    c.fillStyle = "#79b3b5bb";
    c.fill();
    for (let i = 0; i < 10; i++)
      line(
        c,
        [
          [i * 103, 598 + Math.sin(i) * 10],
          [i * 103 + 42, 598 + Math.sin(i) * 10],
        ],
        "#d2e1c0",
        2,
      );
  }
  if (fx.dinosaur) {
    const count = Math.min(3, fx.dinosaur);
    for (let i = 0; i < count; i++)
      dinosaur(
        c,
        220 + i * 165 + Math.sin(t * 0.23 + i) * 22,
        440 + (i % 2) * 84,
        t + i,
        0.68 + i * 0.13,
        fx.flood > 0,
      );
    if (fx.alien) {
      rect(c, 186, 331, 52, 14, "#eadab2", 2, ink);
      text(c, "DIPLOMAT", 212, 341, 6);
    }
  }
  if (fx.pigeons) {
    for (let i = 0; i < Math.min(10, fx.pigeons * 2 + 2); i++)
      bird(c, 460 + (i % 6) * 18, 239 - Math.floor(i / 6) * 15, t + i, 0.8);
    bird(c, 521, 344, t, 1.2);
    if (fx.magnet) bird(c, 817, 403, t, 1.3);
  }
  if (fx.ducks) {
    for (let i = 0; i < Math.min(6, fx.ducks + 2); i++)
      duck(c, 600 + i * 19 + Math.sin(t + i) * 6, 386 + (i % 2) * 7, t);
    tool(c, "boat", 676, 414, t, 0.55);
  }
  if (fx.alien) {
    ufo(c, 832 + Math.sin(t * 0.3) * 18, 199, t);
    person(c, 848, 351, t, "#7ca28a");
    ellipse(c, 848, 328, 8, 7, "#8bac86", ink);
    ellipse(c, 845, 328, 2, 2, ink);
    ellipse(c, 851, 328, 2, 2, ink);
  }
  if (fx.band) {
    for (let i = 0; i < 5; i++)
      tool(
        c,
        "band",
        590 + i * 28 + Math.sin(t * 0.5) * 17,
        452 + (i % 2) * 7,
        t + i,
        0.6,
      );
  }
  if (fx.fire) {
    tool(c, "firefighter", 250, 300, t, 0.65);
    if (w.flags.firePermit) {
      for (let i = 0; i < 3; i++) {
        path(
          c,
          [
            [122 + i * 15, 292],
            [115 + i * 15, 272],
            [125 + i * 15, 277],
            [129 + i * 15, 259 - Math.sin(t * 8 + i) * 6],
            [138 + i * 15, 282],
            [134 + i * 15, 295],
          ],
          "#d18148",
          "",
          0,
        );
      }
    }
  }
  if (fx.moon || e.id === "moon") {
    const descending = e.id === "moon" && w.recent.at(-1) !== "moon";
    const mx = descending ? 790 : 760,
      my = descending ? 190 + Math.sin(t) * 3 : 86;
    const ms = descending ? 1.35 : 0.65 + Math.min(5, fx.moon) * 0.09;
    ellipse(c, mx, my, 48 * ms, 48 * ms, "#e4dabc", ink);
    ellipse(c, mx - 15, my - 13, 9 * ms, 9 * ms, "#c6c7a9");
    ellipse(c, mx + 17, my + 11, 13 * ms, 13 * ms, "#c6c7a9");
    ellipse(c, mx - 7, my + 24, 6, 6, "#c6c7a9");
    if (!descending) {
      rect(c, mx + 22, my + 23, 20, 29, "#e9bb76", 1, ink);
      text(c, "P", mx + 32, my + 36, 9);
      text(c, "FINE", mx + 32, my + 45, 4);
    } else {
      ellipse(c, mx - 9, my - 1, 2, 3, ink);
      ellipse(c, mx + 6, my - 1, 2, 3, ink);
      line(
        c,
        [
          [mx - 5, my + 10],
          [mx + 4, my + 9],
        ],
        ink,
        2,
      );
    }
  }
  if (fx.wind) {
    for (let i = 0; i < 3; i++)
      line(
        c,
        [
          [50 + ((t * 40 + i * 250) % 850), 100 + i * 30],
          [105 + ((t * 40 + i * 250) % 850), 100 + i * 30],
        ],
        "#eef0cb99",
        2,
      );
  }
  w.evidence
    .filter((a) => a.kind === "crater")
    .slice(-7)
    .forEach((a) => {
      ellipse(c, a.x, a.y, 21, 9, "#927e60");
      ellipse(c, a.x + 1, a.y - 2, 15, 5, "#6f7056");
      line(
        c,
        [
          [a.x - 20, a.y - 4],
          [a.x - 28, a.y - 10],
          [a.x - 34, a.y - 6],
        ],
        "#a18e68",
        3,
      );
    });
  if (w.damage) {
    for (let i = 0; i < Math.min(4, w.damage); i++)
      line(
        c,
        [
          [330 + i * 12, 279],
          [338 + i * 12, 287],
          [333 + i * 12, 295],
          [342 + i * 12, 305],
        ],
        "#7b775b",
        2,
      );
  }
  if (fx.bureaucracy) {
    rect(c, 442, 282, 127, 17, "#ce7658", 1, ink);
    text(
      c,
      w.count >= 25 ? "PRESIDENT WAS HERE" : "EXEMPLARY PUBLIC SERVICE",
      505,
      294,
      7,
      cream,
    );
  }
  if (w.catSaved) {
    ellipse(c, 375, 565, 7, 5, "#d5a565", ink);
    path(
      c,
      [
        [378, 561],
        [377, 552],
        [383, 555],
        [387, 551],
        [388, 562],
      ],
      "#d5a565",
    );
    line(
      c,
      [
        [368, 566],
        [360, 562],
        [362, 556],
      ],
      "#99764e",
      2,
    );
  }
  // Caller location pulses during the call; direct operations share the same world coordinates.
  // Visual callbacks live in the world, and keep their own durable flags.
  if (fx.dinosaur && w.catSaved) {
    const dx = 220 + Math.sin(t * 0.23) * 22;
    ellipse(c, dx + 42, 357, 7, 5, "#d5a565", ink);
    path(
      c,
      [
        [dx + 37, 355],
        [dx + 37, 347],
        [dx + 42, 351],
        [dx + 46, 347],
        [dx + 48, 357],
      ],
      "#d5a565",
    );
    line(
      c,
      [
        [dx + 37, 360],
        [dx + 30, 355],
      ],
      "#99764e",
      2,
    );
  }
  if (fx.dinosaur && fx.bureaucracy) {
    const dx = 220 + Math.sin(t * 0.23) * 22;
    path(
      c,
      [
        [dx + 23, 400],
        [dx + 18, 410],
        [dx + 25, 426],
        [dx + 31, 410],
      ],
      "#cc7050",
      ink,
      1,
    );
    rect(c, dx - 15, 411, 20, 12, cream, 1, ink);
    text(c, "STAFF", dx - 5, 420, 4);
  }
  if (w.flags.ladderMoon) {
    c.save();
    c.translate(728, 280);
    c.rotate(-0.22);
    tool(c, "ladder", 0, 0, t, 0.8);
    tool(c, "ladder", 0, -50, t, 0.8);
    tool(c, "ladder", 0, -100, t, 0.8);
    c.restore();
    person(c, 710, 187, t, "#ca7756", 0.65);
  }
  if (w.flags.busFlying) {
    const bx = 680 + Math.sin(t * 0.4) * 25,
      by = 222 + Math.sin(t * 1.3) * 6;
    rect(c, bx - 35, by - 22, 70, 28, "#d4b46a", 6, ink);
    for (let i = 0; i < 4; i++)
      rect(c, bx - 26 + i * 14, by - 17, 10, 10, "#d9e5c9", 1, ink);
    line(
      c,
      [
        [bx - 20, by + 7],
        [bx - 23, by + 22],
      ],
      ink,
      3,
    );
    line(
      c,
      [
        [bx + 24, by + 7],
        [bx + 23, by + 22],
      ],
      ink,
      3,
    );
    text(c, "BUS STOP", bx, by + 38, 7);
  }
  if (w.flags.mayorCabinet) {
    for (let i = 0; i < 3; i++) {
      const x = 465 + i * 17;
      rect(c, x, 350, 10, 17, "#b9c5b0", 2, ink);
      rect(c, x + 2, 354, 6, 8, "#eadb9a");
      ellipse(c, x + 5, 350, 3, 1, "#7e967b");
    }
    text(c, "CABINET", 491, 383, 6);
  }
  if (fx.ducks > 1) {
    for (let i = 0; i < 2; i++) {
      const dx = 622 + Math.sin(t * 0.25 + i) * 35 + i * 50,
        dy = 590 + Math.sin(t + i) * 4;
      tool(c, "boat", dx, dy, t, 0.48);
      duck(c, dx - 5, dy - 15, t);
    }
    text(c, "INTERNATIONAL WATERS", 663, 624, 7, "#3d706b");
  }
  const activeIncident = w.recent.at(-1) !== e.id;
  if (activeIncident && e.id === "pigeon") bird(c, 520, 344, t, 1.4);
  if (activeIncident && e.id === "helipad") helicopter(c, 346, 402, t);
  if (activeIncident && e.id === "roof") {
    car(c, 346, 475, "#ecd286");
    text(c, "ICE CREAM", 346, 449, 6);
  }
  if (activeIncident && e.id === "mayor") {
    rect(c, 543, 320, 45, 65, "#b86b55", 4, ink);
    rect(c, 548, 327, 27, 44, "#a8c8b7", 2, ink);
    person(c, 560, 363, t, "#4f6573", 0.8);
    line(
      c,
      [
        [548, 342],
        [573, 342],
      ],
      "#57715e",
      2,
    );
    rect(c, 578, 337, 5, 14, cream, 1);
    text(c, "CRISPS", 565, 380, 5, cream);
  }
  if (activeIncident && e.id === "icecream") {
    car(c, 690, 425, "#ecd286");
    rect(c, 674, 389, 35, 15, "#f0d2a4", 3, ink);
    text(c, "ICE CREAM", 690, 399, 5);
    ellipse(c, 692, 385, 6, 6, "#e4b5ba", ink);
  }
  if (activeIncident && e.id === "dino-house") {
    dinosaur(c, 365 + Math.sin(t * 2) * 4, 336, t, 0.6);
    for (let i = 0; i < 5; i++)
      rect(c, 327 + i * 7, 297 + Math.sin(t * 8 + i) * 9, 4, 3, "#deaf69", 1);
  }
  if (!op && Math.floor(t / 6) % 3 === 0) {
    const quip = fx.magnet
      ? "THAT WAS MY CAR."
      : fx.pigeons
        ? "BREAD IS MONEY."
        : fx.dinosaur
          ? "IT HAS A TIE NOW?"
          : w.count
            ? "THIS IS NORMAL."
            : "NICE DAY.";
    rect(c, 530, 469, 111, 21, "#f3eacb", 5, "#889a76");
    text(c, quip, 585, 483, 7, "#5b7054");
    path(
      c,
      [
        [555, 490],
        [561, 498],
        [568, 490],
      ],
      "#f3eacb",
      "#889a76",
      1,
    );
  }
  if (!op && !celebrate) {
    const [x, y] = e.location;
    ellipse(
      c,
      x,
      y,
      24 + Math.sin(t * 3) * 3,
      11 + Math.sin(t * 3) * 1.5,
      "#f0df8b44",
      "#e6cf78",
    );
    rect(c, x - 9, y - 55, 18, 22, "#f7e7bd", 7, ink);
    text(c, "!", x, y - 39, 14, "#c65a40");
    line(
      c,
      [
        [x, y - 32],
        [x, y - 18],
      ],
      "#a28b5c",
      1,
    );
  }
  if (op) {
    drawOperation(c, op, t);
    if (op.finished && op.result) {
      c.save();
      c.globalAlpha = Math.max(0, 1 - op.settle);
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6,
          d = 15 + op.settle * 90;
        ellipse(
          c,
          op.result.x + Math.cos(a) * d,
          op.result.y + Math.sin(a) * d * 0.6,
          6 * (1 - op.settle * 0.4),
          6 * (1 - op.settle * 0.4),
          ["#f2d579", "#e5ad67", "#f1e5bf"][i % 3],
        );
      }
      text(
        c,
        op.result.score > 60
          ? "RESPONSE DELIVERED"
          : "RESPONSE DEFINITELY OCCURRED",
        op.result.x,
        op.result.y - 60,
        12,
        "#38523f",
      );
      c.restore();
    }
  }
  if (celebrate) {
    const confettiTime = reduced ? 0 : time;
    for (let i = 0; i < 65; i++) {
      c.save();
      c.translate(
        (i * 137 + Math.sin(confettiTime + i) * 14) % 1000,
        (i * 83 + confettiTime * (30 + (i % 4) * 10)) % 640,
      );
      c.rotate(confettiTime + i);
      rect(
        c,
        -3,
        -4,
        6,
        9,
        ["#cf7151", "#e7c663", "#648b79", "#a197af"][i % 4],
      );
      c.restore();
    }
  }
}
function drawOperation(c: C, o: Operation, t: number) {
  const { target } = o;
  ellipse(c, target.x, target.y, 48, 24, "#f8e6a54d", "#fff3c9");
  c.save();
  c.setLineDash([7, 5]);
  ellipse(c, target.x, target.y, 53, 27, "#ffffff00", "#425b44");
  c.restore();
  text(
    c,
    o.kind === "magnet" ? "DEPOT" : "TARGET",
    target.x,
    target.y + 43,
    10,
    "#2d493b",
  );
  if (o.kind === "steer") {
    line(
      c,
      [
        [o.x, o.y],
        [o.aim.x, o.aim.y],
      ],
      "#f0e3b199",
      2,
    );
    tool(c, o.tool, o.x, o.y, t, 0.95);
    for (const [x, y] of [
      [350, 335],
      [500, 320],
      [770, 330],
    ])
      ellipse(c, x, y, 32, 16, "#cf6e4d22", "#ca7755");
  }
  if (o.kind === "magnet") {
    o.cars.forEach((carPos, i) => {
      if (!o.pickup.has(i)) {
        car(c, carPos.x, carPos.y, ["#d7b664", "#bd7864", "#7c9aa2"][i]);
        ellipse(c, carPos.x, carPos.y, 31, 14, "#fff3c911", "#fff0bf");
      } else
        car(
          c,
          o.x - 40 + i * 30,
          o.y + 25 + i * 8,
          ["#d7b664", "#bd7864", "#7c9aa2"][i],
          i % 2 ? 1 : -1,
        );
    });
    magnet(c, o.x, o.y - 12);
    for (let i = 0; i < 3; i++) {
      c.save();
      c.setLineDash([4, 6]);
      ellipse(
        c,
        o.x,
        o.y,
        38 + i * 13,
        22 + i * 8,
        "#ffffff00",
        `rgba(251,233,177,${0.7 - i * 0.2})`,
      );
      c.restore();
    }
  }
  if (o.kind === "rescue") {
    helicopter(c, o.aim.x, 130, t);
    line(
      c,
      [
        [o.aim.x, 150],
        [o.aim.x + 35, o.target.y],
      ],
      "#fff3c799",
      1,
    );
    if (o.shotTime >= 0) {
      line(
        c,
        [
          [o.aim.x, 150],
          [o.shotX, o.shotY],
        ],
        "#5a634e",
        3,
      );
      tool(c, "firefighter", o.shotX, o.shotY, t, 0.55);
    } else ellipse(c, o.aim.x + 35, o.target.y, 13, 7, "#d78a5544", "#efda9e");
    text(c, "WIND →", o.aim.x + 75, 150, 9, "#647d66");
  }
  if (o.kind === "launch") {
    tool(c, o.tool, 90, 500, t, 0.9);
    line(
      c,
      [
        [o.aim.x - 15, o.aim.y],
        [o.aim.x + 15, o.aim.y],
      ],
      "#f7eed1",
      3,
    );
    line(
      c,
      [
        [o.aim.x, o.aim.y - 15],
        [o.aim.x, o.aim.y + 15],
      ],
      "#f7eed1",
      3,
    );
    if (o.shotTime >= 0) {
      c.save();
      c.translate(o.shotX, o.shotY);
      c.rotate((o.time - o.shotTime) * 5);
      tool(c, o.tool, 0, 0, t, 0.7);
      c.restore();
    }
    text(c, "WIND → 65m", 110, 350, 12, "#526c51");
  }
  if (o.kind === "timing") {
    rect(c, 220, 157, 560, 91, "#f4ebce", 6, ink);
    text(c, "MINISTRY OF EXCESSIVE PRECISION", 500, 180, 10);
    rect(c, 245, 197, 510, 24, "#d5ccac", 3);
    rect(c, 245 + 510 * 0.58, 197, 510 * 0.2, 24, "#80a075", 1);
    line(
      c,
      [
        [245 + o.needle() * 5.1, 190],
        [245 + o.needle() * 5.1, 229],
      ],
      "#bd513d",
      5,
    );
    tool(c, o.tool, o.target.x, o.target.y, t, 0.8);
  }
  if (o.time - o.lastStamp < 0.7) {
    rect(
      c,
      o.target.x - 55,
      o.target.y - 80,
      110,
      25,
      o.lastQuality > 65 ? "#f2e4b6" : "#ead2aa",
      2,
      ink,
    );
    text(
      c,
      o.lastQuality > 65 ? "APPROVED" : "CLOSE ENOUGH",
      o.target.x,
      o.target.y - 63,
      11,
    );
  }
}
