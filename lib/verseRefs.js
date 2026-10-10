// Parses and resolves human-readable Bible verse references used in
// _input/topics/*.md frontmatter, e.g. "2 Timothy 2:25" or "1 Peter 3:15-16".
//
// This is a build-time utility (required from .eleventy.js, used as a
// template filter, and used by scripts/sync-topic-source-links.js), not an
// 11ty template itself.

const fs = require("fs");
const path = require("path");

const REF_PATTERN = /^(.*?)\s+(\d+):(\d+)(?:[-–](\d+))?$/;

// "2:25" or "3:15-16" - the chapter:verse portion alone, with no book title.
function chapterVerseOf(parsed) {
  const verses = parsed.verseEnd ? `${parsed.verseStart}-${parsed.verseEnd}` : `${parsed.verseStart}`;
  return `${parsed.chapter}:${verses}`;
}

// parseVerseRef("1 Peter 3:15-16")
//   -> { bookTitle: "1 Peter", chapter: 3, verseStart: 15, verseEnd: 16 }
function parseVerseRef(ref) {
  const m = ref.trim().match(REF_PATTERN);
  if (!m) {
    throw new Error(`Unrecognized verse reference: "${ref}"`);
  }
  const [, bookTitle, chapter, verseStart, verseEnd] = m;
  return {
    bookTitle: bookTitle.trim(),
    chapter: parseInt(chapter, 10),
    verseStart: parseInt(verseStart, 10),
    verseEnd: verseEnd ? parseInt(verseEnd, 10) : null,
  };
}

// resolveVerseRef(ref, books, getChapters)
//   books: array of { folder, tag, order, title } (see _input/_data/books.js)
//   getChapters: (tag) => array of 11ty page objects for that book's collection
//
// Returns the parsed reference plus the resolved book, the matching chapter
// page, and ready-to-use links (a chapter URL and a chapter+verse-anchor URL).
function resolveVerseRef(ref, books, getChapters) {
  const parsed = parseVerseRef(ref);

  const book = books.find(
    (b) => b.title && b.title.trim().toLowerCase() === parsed.bookTitle.toLowerCase()
  );
  if (!book) {
    throw new Error(`Unknown book "${parsed.bookTitle}" in reference "${ref}"`);
  }

  const chapters = getChapters(book.tag) || [];
  const chapterPage = chapters.find(
    (c) => c.data.layout !== "book.njk" && parseInt(c.data.title, 10) === parsed.chapter
  );
  if (!chapterPage) {
    throw new Error(`Chapter ${parsed.chapter} not found in "${book.title}" for reference "${ref}"`);
  }

  const chapterVerse = chapterVerseOf(parsed);
  const fragment = `${parsed.chapter}:${parsed.verseStart}`;

  return {
    ...parsed,
    book,
    chapterPage,
    chapterUrl: chapterPage.url,
    url: `${chapterPage.url}#${fragment}`,
    label: `${book.title} ${parsed.chapter}`,
    chapterVerse,
    verseLabel: `${book.title} ${chapterVerse}`,
  };
}

// resolveVerseRefToFile(ref, books, booksDir)
//   booksDir: absolute path to _input/books
//
// Like resolveVerseRef, but resolves against the raw filesystem instead of
// an 11ty collection - used by scripts/sync-topic-source-links.js, which
// runs standalone (outside an 11ty build) to link a topic file's body
// straight to the chapter .md files it references, for browsing/editing the
// repo directly (GitHub, VS Code). Never used for the published site.
function resolveVerseRefToFile(ref, books, booksDir) {
  const parsed = parseVerseRef(ref);

  const book = books.find(
    (b) => b.title && b.title.trim().toLowerCase() === parsed.bookTitle.toLowerCase()
  );
  if (!book) {
    throw new Error(`Unknown book "${parsed.bookTitle}" in reference "${ref}"`);
  }

  const bookDir = path.join(booksDir, book.folder);
  const chapterFile = fs.readdirSync(bookDir).find((f) => {
    const m = f.match(/^(\d+)\.md$/);
    return m && parseInt(m[1], 10) === parsed.chapter;
  });
  if (!chapterFile) {
    throw new Error(`Chapter ${parsed.chapter} not found in "${book.title}" for reference "${ref}"`);
  }

  const chapterVerse = chapterVerseOf(parsed);

  return {
    ...parsed,
    book,
    chapterFile,
    filePath: path.join(bookDir, chapterFile),
    fragment: `${parsed.chapter}:${parsed.verseStart}`,
    chapterVerse,
    verseLabel: `${book.title} ${chapterVerse}`,
  };
}

// groupVerses(verses)
//
// Normalizes a topic file's `verses:` frontmatter into a list of
// { group, refs } - `verses` may be either the plain form (a flat array of
// reference strings, group is null) or a grouped form (a mapping of group
// name -> array of reference strings, for topics like church-discipline.md
// that organize references under headings such as "Key Verses"/"All
// Verses"). Every ref in either form is still fully resolved, validated,
// and cross-linked the same way - grouping is purely organizational.
function groupVerses(verses) {
  if (!verses) return [];
  if (Array.isArray(verses)) return [{ group: null, refs: verses }];
  return Object.entries(verses).map(([group, refs]) => ({ group, refs: refs || [] }));
}

// A `verses:` list item is either a plain reference string (no note), or
// an object { ref, note } carrying a short annotation alongside the
// reference, e.g.:
//   - Hebrews 12:10
//   - ref: Deuteronomy 25:4
//     note: witnesses must verify accusations
// normalizeVerseEntry() turns either shape into { ref, note }, note being
// undefined when absent, so every other function only has to deal with one
// shape.
function normalizeVerseEntry(item) {
  if (typeof item === "string") return { ref: item, note: undefined };
  if (item && typeof item === "object" && typeof item.ref === "string") {
    return { ref: item.ref, note: item.note };
  }
  throw new Error(`Invalid verses entry: ${JSON.stringify(item)}`);
}

// Flattens groupVerses() output into a single ordered list of
// { ref, group, note }.
function flattenVerseGroups(verses) {
  return groupVerses(verses).flatMap(({ group, refs }) =>
    refs.map((item) => ({ group, ...normalizeVerseEntry(item) }))
  );
}

module.exports = {
  parseVerseRef,
  resolveVerseRef,
  resolveVerseRefToFile,
  groupVerses,
  flattenVerseGroups,
  normalizeVerseEntry,
};
