import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const { SiteHeader } = await import("../src/components/layout/site-header.tsx");
const { LandingPage } = await import("../src/components/landing/landing-page.tsx");

test("rendered product navigation exposes one CIVX, not competing methodology products", () => {
  const header = renderToStaticMarkup(createElement(SiteHeader));
  const home = renderToStaticMarkup(createElement(LandingPage));
  const markup = header + home;
  assert.match(header, /href="\/explore"/);
  assert.match(header, /href="\/compare"/);
  assert.match(header, /href="\/methodology"/);
  assert.match(header, /href="\/sources"/);
  assert.doesNotMatch(markup, /href="\/v[12](?:\/|"|\?)/);
  assert.doesNotMatch(markup, /CIVX\s+v[12](?:\s|<|$)/);
  assert.doesNotMatch(markup, /aria-label="[^"]*(?:release|version)[^"]*switch/i);
});
