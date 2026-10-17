import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
const dist = path.resolve("dist");
let html = await readFile(path.join(dist, "index.html"), "utf8");
for (const match of [
  ...html.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g),
]) {
  let css = await readFile(path.join(dist, match[1]), "utf8");
  for (const asset of [
    ...css.matchAll(/url\(["']?(\/fonts\/[^"')]+)["']?\)/g),
  ]) {
    const bytes = await readFile(path.join(dist, asset[1]));
    css = css.replaceAll(
      asset[0],
      `url("data:font/woff2;base64,${bytes.toString("base64")}")`,
    );
  }
  html = html.replace(match[0], () => `<style>${css}</style>`);
}
for (const match of [
  ...html.matchAll(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/g),
]) {
  const js = await readFile(path.join(dist, match[1]), "utf8");
  html = html.replace(
    match[0],
    () =>
      `<script type="module">${js.replaceAll("</script", "<\\/script")}</script>`,
  );
}
const icon = await readFile(path.join(dist, "favicon.svg"));
html = html.replace(
  'href="/favicon.svg"',
  `href="data:image/svg+xml;base64,${icon.toString("base64")}"`,
);
await mkdir("release", { recursive: true });
await writeFile("release/PLAY.html", html);
console.log(
  `Portable game: release/PLAY.html (${Math.round(Buffer.byteLength(html) / 1024)} KiB)`,
);
