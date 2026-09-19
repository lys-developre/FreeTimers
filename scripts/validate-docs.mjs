import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsRoot = path.join(root, "docs");
const markdownFiles = [];

function collectMarkdown(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectMarkdown(entryPath);
    } else if (entry.name.endsWith(".md")) {
      markdownFiles.push(entryPath);
    }
  }
}

function slugify(heading) {
  return heading
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, "-");
}

function headingAnchors(filePath) {
  const counts = new Map();
  const anchors = new Set();
  const content = fs.readFileSync(filePath, "utf8");

  for (const match of content.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const base = slugify(match[1]);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }

  return anchors;
}

function reportError(message) {
  errors.push(message);
}

const errors = [];
collectMarkdown(docsRoot);

for (const filePath of markdownFiles) {
  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(root, filePath);

  for (const [pattern, description] of [
    [/^\*\*Status:\*\* (Active|Decision|Draft|Historical)/m, "status"],
    [/^\*\*Last reviewed:\*\* \d{4}-\d{2}-\d{2}/m, "review date"],
    [/^## Resumen en español$/m, "Spanish summary"],
  ]) {
    if (!pattern.test(content)) {
      reportError(`${relativePath}: missing ${description}`);
    }

    if (/^\*\*Deterministic contract:\*\* Yes$/m.test(content)) {
      const englishStart = content.indexOf("## English contract");
      const spanishStart = content.indexOf("## Contrato completo en español");
      if (englishStart === -1 || spanishStart === -1 || englishStart > spanishStart) {
        reportError(
          `${relativePath}: deterministic contract needs complete English and Spanish sections`,
        );
      } else {
        const markerPattern = /<!-- contract-section:([a-z0-9-]+) -->/g;
        const englishMarkers = [
          ...content.slice(englishStart, spanishStart).matchAll(markerPattern),
        ].map((match) => match[1]);
        const spanishMarkers = [
          ...content.slice(spanishStart).matchAll(markerPattern),
        ].map((match) => match[1]);
        if (
          englishMarkers.length === 0 ||
          englishMarkers.join("|") !== spanishMarkers.join("|")
        ) {
          reportError(
            `${relativePath}: deterministic English/Spanish contract sections are not structurally aligned`,
          );
        }
      }
    }
  }

  content.split("\n").forEach((line, index) => {
    const normalizedLine = line.replace(/\r$/, "");
    if (/\t| {3,}$/.test(normalizedLine)) {
      reportError(`${relativePath}:${index + 1}: trailing whitespace or tab`);
    }
  });

  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, "");
    if (/^(https?:|mailto:)/i.test(target)) {
      continue;
    }

    const [targetPath, anchor] = target.split("#");
    const resolvedPath = path.resolve(path.dirname(filePath), targetPath || relativePath);
    if (!fs.existsSync(resolvedPath)) {
      reportError(`${relativePath}: missing link ${target}`);
      continue;
    }

    if (anchor && resolvedPath.endsWith(".md")) {
      if (!headingAnchors(resolvedPath).has(decodeURIComponent(anchor))) {
        reportError(`${relativePath}: missing anchor ${target}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${markdownFiles.length} documentation files.`);
}
