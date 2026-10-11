#!/usr/bin/env node
// Keeps the links between topic files and chapter files in sync in both
// directions, computed from topic files' hand-authored `verses:` lists -
// never hand-maintained on either side. Only ever touches frontmatter -
// a topic file's content area is reserved for human-written longform
// prose and is never read or rewritten by this script.
//
// A topic's `verses:` may be a flat list, a mapping of group name -> list,
// or an array of single-key group-wrapper objects (one group per array
// item, e.g. `- key_verses: [...]` / `- all_verses: [...]`, for an
// explicit/unambiguous group order) - see lib/verseRefs.js's
// classifyVerses/groupVerses/flattenVerseGroups. Each list item may be a
// plain reference string or an { ref, note } object carrying a short
// annotation - see normalizeVerseEntry. Every form goes through the same
// code everywhere a topic's verses are read (here, and in .eleventy.js's
// chapterTopics collection and topic.njk). Grouping and notes are purely
// organizational; every ref in every form is resolved, validated, and
// cross-linked identically.
//
// 1. Topic file frontmatter: enriches every `verses:` entry in place with
//    a generated `file` (chapter path, relative to _input/books/, no
//    extension) and `fragment` (chapter:verse anchor), e.g.
//    `- ref: Hebrews 12:10 \n  note: '' \n  file: 58-hebrews/12 \n
//    fragment: '12:10'`. A bare string entry is promoted to a full object.
//    Both fields are always recomputed fresh from `ref` - they're a
//    convenience for reading the frontmatter directly, never read back as
//    authoritative by anything (the live site still resolves `ref` itself
//    on every build).
//
// 2. Chapter file frontmatter: writes a generated `topics:` list into the
//    frontmatter of every chapter file referenced by at least one topic
//    (e.g. `topics:\n  - answer-with-gentleness 2:25`), and removes it
//    from chapter files that are no longer referenced. Metadata only -
//    never touches the scripture body/content, and is not rendered on the
//    site (the "Topics in this chapter" block on the live site is computed
//    independently, at build time, by the `chapterTopics` collection in
//    .eleventy.js). This field exists purely so the association is visible
//    when reading a chapter file's own frontmatter directly.
//
// Safe to re-run any time - re-running with nothing changed produces no
// diff on either side. Run after adding or editing a topic file's
// `verses:` list:
//   npm run topics:sync-links

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const yaml = require("js-yaml");
const getBooks = require("../_input/_data/books.js");
const {
  resolveVerseRefToFile,
  classifyVerses,
  flattenVerseGroups,
  normalizeVerseEntry,
} = require("../lib/verseRefs.js");

const TOPICS_DIR = path.join(__dirname, "..", "_input", "topics");
const BOOKS_DIR = path.join(__dirname, "..", "_input", "books");

// Splits "---\n<frontmatter>\n---\n<body>" so the body - a topic file's
// human-written content area - is always carried through completely
// untouched; only ever the frontmatter half is rewritten. Tolerates \r\n
// line endings - a handful of chapter files use them while most use \n.
function splitFrontmatter(raw) {
  const m = raw.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/);
  return m ? { header: m[1], body: m[2] } : null;
}

// --- 1. Topic file frontmatter: enrich verses: entries ---------------------

// Matches the `verses:` key and everything indented under it, however
// deeply nested (groups, and each item's ref/note/file/fragment lines) -
// every continuation line has at least one leading space; the match stops
// at the first line that doesn't (the next top-level key, or the closing
// `---`).
const VERSES_KEY_PATTERN = /\nverses:\n(?:[ \t].*\n?)*/;

function enrichVerseItem(item, books) {
  const { ref, note } = normalizeVerseEntry(item);
  const resolved = resolveVerseRefToFile(ref, books, BOOKS_DIR);
  // Relative to _input/books/ (e.g. "55-timothy-2/02") - a plain
  // book-folder path, independent of where topic files happen to live.
  // No extension - whatever actually needs a loadable path (nothing does
  // today; everything re-resolves `ref` itself) adds ".md" itself rather
  // than this field baking an extension in.
  const bookRelPath = path
    .relative(BOOKS_DIR, resolved.filePath)
    .split(path.sep)
    .join("/")
    .replace(/\.md$/, "");

  // Every entry always gets all four fields, in the same order, even when
  // there's no note - so every topic file's verses: entries share one
  // consistent shape (ref, note, file, fragment) whether or not that
  // particular topic uses notes. An empty note is falsy in topic.njk, so
  // it's never displayed.
  return { ref, note: note ?? "", file: bookRelPath, fragment: resolved.fragment };
}

// Rebuilds a topic's `verses:` value with every entry enriched, preserving
// whichever of the three supported `verses:` idioms it was already using
// (see classifyVerses in lib/verseRefs.js) - a mapping stays a mapping, a
// group-wrapper array (e.g. `- key_verses: [...]`) stays a group-wrapper
// array with the same group order, and a flat list stays a flat list.
function enrichVerses(verses, books) {
  const { kind, groups } = classifyVerses(verses);
  const enriched = groups.map(({ group, refs }) => ({
    group,
    refs: refs.map((item) => enrichVerseItem(item, books)),
  }));

  if (kind === "mapping") {
    const out = {};
    for (const { group, refs } of enriched) out[group] = refs;
    return out;
  }
  if (kind === "groupArray") {
    return enriched.map(({ group, refs }) => ({ [group]: refs }));
  }
  return enriched.length ? enriched[0].refs : [];
}

function buildVersesYaml(enrichedVerses) {
  return "\n" + yaml.dump({ verses: enrichedVerses }, { lineWidth: -1 }).replace(/\n$/, "");
}

function updateTopicFile(filePath, originalVerses, books) {
  const raw = fs.readFileSync(filePath, "utf8");
  const split = splitFrontmatter(raw);
  if (!split) {
    console.warn(`Skipping ${filePath}: no frontmatter found`);
    return false;
  }

  const innerMatch = split.header.match(/^---\r?\n([\s\S]*)\r?\n---\r?\n$/);
  if (!innerMatch || !VERSES_KEY_PATTERN.test(innerMatch[1])) return false;

  const versesYaml = buildVersesYaml(enrichVerses(originalVerses, books));
  const newInner = innerMatch[1].replace(VERSES_KEY_PATTERN, versesYaml);
  const newHeader = `---\n${newInner}\n---\n`;
  if (newHeader === split.header) return false;

  // Body (the content area) is carried through exactly as read - never
  // touched by this script.
  fs.writeFileSync(filePath, newHeader + split.body);
  return true;
}

// --- 2. Chapter file frontmatter: `topics:` list ---------------------------

// Matches a generated `topics:` key and its list items, wherever it sits in
// the frontmatter (always preceded by a newline, since `title:` is always
// the first key in every chapter file).
const TOPICS_KEY_PATTERN = /\ntopics:\n(?:[ \t]*-[^\n]*\n?)*/;

// Each entry is "<topic-slug> <chapter>:<verse>", e.g.
// "answer-with-gentleness 2:25" - the same chapter:verse anchor format
// already used in the chapter's own <a name="C:V"> tags, so a chapter with
// multiple verses tied to the same topic gets one entry per verse rather
// than collapsing them into a single ambiguous slug.
function buildTopicsKey(entries) {
  return "\ntopics:\n" + entries.map((entry) => `  - ${entry}`).join("\n");
}

// Sorts "slug C:V" entries by slug, then numerically by chapter/verse
// (plain string sort would put "2:25" before "2:5").
function compareTopicEntries(a, b) {
  const [, aSlug, aC, aV] = a.match(/^(.*) (\d+):(\d+)/);
  const [, bSlug, bC, bV] = b.match(/^(.*) (\d+):(\d+)/);
  return aSlug.localeCompare(bSlug) || Number(aC) - Number(bC) || Number(aV) - Number(bV);
}

function collectChapterFiles(books) {
  const files = [];
  for (const book of books) {
    const bookDir = path.join(BOOKS_DIR, book.folder);
    for (const name of fs.readdirSync(bookDir)) {
      if (/^\d+\.md$/.test(name)) files.push(path.join(bookDir, name));
    }
  }
  return files;
}

function updateChapterFile(filePath, entries) {
  const raw = fs.readFileSync(filePath, "utf8");
  const split = splitFrontmatter(raw);
  if (!split) {
    console.warn(`Skipping ${filePath}: no frontmatter found`);
    return false;
  }

  const innerMatch = split.header.match(/^---\r?\n([\s\S]*)\r?\n---\r?\n$/);
  if (!innerMatch) return false;

  // Nothing to add and no existing generated key to remove - leave the file
  // completely untouched (don't even reconstruct the header, which would
  // needlessly normalize its line endings with zero semantic change).
  const hadTopicsKey = TOPICS_KEY_PATTERN.test(innerMatch[1]);
  if (!hadTopicsKey && !entries.length) return false;

  let inner = innerMatch[1].replace(TOPICS_KEY_PATTERN, "");
  if (entries.length) {
    inner += buildTopicsKey(entries);
  }

  // Reassembled with \n regardless of the original style - only taken for
  // chapter files that actually need a topics: key added/changed, which
  // currently excludes every \r\n-styled file (none are topic-referenced).
  const newHeader = `---\n${inner}\n---\n`;
  if (newHeader === split.header) return false;

  fs.writeFileSync(filePath, newHeader + split.body);
  return true;
}

// --- Main -------------------------------------------------------------------

function main() {
  const books = getBooks();
  const topicFiles = fs
    .readdirSync(TOPICS_DIR)
    .filter((f) => f.endsWith(".md") && f !== "index.md");

  let changed = 0;
  // chapter file path -> set of "<topic-slug> <chapter>:<verse>" entries
  const chapterTopics = new Map();

  for (const file of topicFiles) {
    const filePath = path.join(TOPICS_DIR, file);
    const slug = file.replace(/\.md$/, "");

    let data;
    try {
      ({ data } = matter(fs.readFileSync(filePath, "utf8")));
    } catch (err) {
      console.error(`Failed to read ${file}: ${err.message}`);
      process.exitCode = 1;
      continue;
    }
    const flatRefs = flattenVerseGroups(data.verses);
    if (!flatRefs.length) continue;

    try {
      for (const { ref } of flatRefs) {
        const resolved = resolveVerseRefToFile(ref, books, BOOKS_DIR);
        if (!chapterTopics.has(resolved.filePath)) chapterTopics.set(resolved.filePath, new Set());
        chapterTopics.get(resolved.filePath).add(`${slug} ${resolved.chapterVerse}`);
      }
    } catch (err) {
      console.error(`Topic "${file}": ${err.message}`);
      process.exitCode = 1;
      continue;
    }

    try {
      if (updateTopicFile(filePath, data.verses, books)) {
        console.log(`Updated ${path.relative(process.cwd(), filePath)}`);
        changed++;
      }
    } catch (err) {
      console.error(`Failed on ${file}: ${err.message}`);
      process.exitCode = 1;
    }
  }

  for (const chapterFile of collectChapterFiles(books)) {
    const entries = Array.from(chapterTopics.get(chapterFile) || []).sort(compareTopicEntries);
    try {
      if (updateChapterFile(chapterFile, entries)) {
        console.log(`Updated ${path.relative(process.cwd(), chapterFile)}`);
        changed++;
      }
    } catch (err) {
      console.error(`Failed on ${chapterFile}: ${err.message}`);
      process.exitCode = 1;
    }
  }

  if (!changed && process.exitCode !== 1) {
    console.log("All topic/chapter links already up to date.");
  }
}

main();
