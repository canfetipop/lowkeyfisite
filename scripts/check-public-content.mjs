import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const contentRoot = path.resolve("src/content");
const postRoot = path.join(contentRoot, "posts");
const categoryPath = path.join(contentRoot, "post-categories.json");

async function jsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
  }));
  return nested.flat();
}

const violations = [];
const categoryDocument = JSON.parse(await readFile(categoryPath, "utf8"));

for (const category of categoryDocument.categories ?? []) {
  if (category.visibility !== "public") {
    violations.push(`Category ${category.id ?? "(missing id)"} is not public.`);
  }
}

for (const file of await jsonFiles(postRoot)) {
  const post = JSON.parse(await readFile(file, "utf8"));
  if (post.visibility !== "public") {
    violations.push(`${path.relative(process.cwd(), file)} is not public.`);
  }
}

if (violations.length) {
  console.error("Private content was found in the public website source:");
  violations.forEach((violation) => console.error(`- ${violation}`));
  console.error("Move private content to emaeveky/lowkeyfi-content before building.");
  process.exit(1);
}

console.log("Public-content privacy check passed.");
