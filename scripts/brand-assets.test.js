import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the header mark and favicon use the same scalable interlocking R", async () => {
  const mark = await read("public/secrole-mark.svg");
  const favicon = await read("public/favicon.svg");

  assert.equal(favicon, mark, "Keep the favicon synchronized with the master mark");
  assert.match(mark, /viewBox="0 0 64 64"/);
  assert.match(mark, /fill="#2B8CFF"/);
  assert.match(mark, /<title>SecRole<\/title>/);
  assert.equal((mark.match(/<path\b/g) || []).length, 2);
  assert.doesNotMatch(mark, /<(?:image|script|filter|foreignObject|linearGradient|radialGradient)\b/i);
  assert.doesNotMatch(mark, /(?:href=|data:|onload=)/i);
});

test("the header mark is decorative beside the existing accessible wordmark", async () => {
  const nav = await read("src/components/Nav.jsx");
  const image = nav.match(/<img\s[\s\S]*?\/>/)?.[0];

  assert.ok(image, "The header must render the vector mark");
  assert.match(image, /src="\/secrole-mark\.svg"/);
  assert.match(image, /alt=""/);
  assert.match(image, /aria-hidden="true"/);
  assert.match(image, /width="32"/);
  assert.match(image, /height="32"/);
  assert.match(image, /flexShrink: 0/);
  assert.match(nav, /SecRole/);
  assert.match(nav, /Microsoft Role Intelligence/);
  assert.doesNotMatch(nav, /🛡|linear-gradient/);
});

test("the favicon is served from the site root on every route", async () => {
  const html = await read("index.html");
  assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg"\s*\/>/);
});
