// Pre-launch check for the entity-home site.
// Parses every JSON-LD block, confirms the Person record is complete,
// and fails while any TODO placeholder or the headshot is missing.
// Usage: node brighamredd.com/scripts/validate.mjs
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "about/index.html"];
const errors = [];
const warnings = [];

const nodes = [];
for (const page of pages) {
  const html = readFileSync(join(root, page), "utf8");
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) errors.push(`${page}: no JSON-LD block`);
  for (const [, body] of blocks) {
    try {
      nodes.push(JSON.parse(body));
    } catch (e) {
      errors.push(`${page}: invalid JSON-LD (${e.message})`);
    }
  }
  const todos = html.match(/TODO/g)?.length ?? 0;
  if (todos) warnings.push(`${page}: ${todos} TODO placeholder(s) still in the page`);
}

const person = nodes.map((n) => n.mainEntity).find((n) => n?.["@type"] === "Person");
if (!person) {
  errors.push("about/index.html: ProfilePage has no Person mainEntity");
} else {
  for (const key of ["name", "url", "image", "jobTitle", "description", "alumniOf", "worksFor", "sameAs"]) {
    if (!person[key]) errors.push(`Person is missing "${key}"`);
  }
  for (const url of person.sameAs ?? []) {
    if (!/^https:\/\//.test(url)) errors.push(`sameAs is not an https URL: ${url}`);
  }
  for (const org of person.worksFor ?? []) {
    if (!org.url) warnings.push(`${org.name}: no company URL in worksFor`);
  }
}

if (!existsSync(join(root, "images/brigham-redd.jpg"))) {
  warnings.push("images/brigham-redd.jpg is missing (the headshot the schema points to)");
}

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`error ${e}`);
const ready = !errors.length && !warnings.length;
console.log(ready ? "ok    ready to launch" : `\n${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : ready ? 0 : 2);
