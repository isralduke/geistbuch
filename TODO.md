# TODO List

Reanalyzed on 2026-10-02 after the content, anchor, and file-ending corrections. Checked items
record automated verification; unchecked items are remaining defects or decisions.
Source-translation accuracy was reported reviewed by the owner, not independently
verified by this structural audit. Only this checklist was edited during reanalysis.
Verse-numbering choices are accepted and are not tracked as concerns here.

## Verified Corrections

- [x] All 1,189 chapter titles match their numeric filenames, including the corrected 1 Kings and 1 Chronicles titles.
- [x] [1 Kings 5](_input/books/11-kings-1/05.md) now contains anchors labeled `5:1` through `5:18`, rather than chapter 6 text.
- [x] All ten previously anchorless chapters now have named verse anchors: 1 Kings 5, Isaiah 41-42, and Micah 1-7. No chapter file is entirely missing named verse anchors.
- [x] Numeric anchor names match their displayed verse labels throughout the repository.
- [x] All 1,189 chapter files end with exactly one newline, displaying one empty final row in VS Code.
- [x] All 66 book indexes list their chapters in numeric filename order and display the matching chapter count.
- [x] `npm run build -- --quiet` passes: 1,256 HTML pages across 66 books and 1,189 chapters. Generated root-relative links and fragment links have existing destinations.

## Remaining Verse Anchor Defects

- [ ] Fix [Jonah 2](_input/books/32-jonah/02.md): verse 2 is still `<a>2:2</a> a>`, with no `name` attribute and stray visible `a>` text. Verify a unique `name="2:2"` target and remove the stray markup.
- [ ] Fix the duplicate `name="13:1"` in [Deuteronomy 13](_input/books/05-deuteronomy/13.md). The parenthetical alternate label and the primary verse currently share a target; preserve the intended numbering while making the targets unambiguous.

## Chapter Navigation

- [x] Exclude book index pages from the chapter collection in [chapter-navigation.njk](_input/_includes/chapter-navigation.njk) via the new `onlyChapters` filter, applied before sorting. Genesis 1's previous link no longer points at its book index mislabeled as a chapter.
- [x] Numeric book titles such as "1 Samuel" no longer interrupt chapter order: `onlyChapters` removes the index page (whose title is not a chapter number) before [sortByChapter](.eleventy.js) ever runs on it.
- [x] Verified previous/next links across all 66 books against numeric chapter filename order with a one-off script (chapter titles, index excluded, form a clean `1..N` sequence per book with zero mismatches, down from the previously recorded 73).
- [x] First chapter's previous link now explicitly targets the book index, labeled with the book's own title (e.g. "← Genesis", "← 1 Samuel") rather than "Chapter <title>" - never labeled as a chapter.
- [ ] Add *automated* regression checks (no test framework exists yet - see "Automated Validation And Documentation" below) for first/last chapters and single-chapter books. Manually verified for this pass: Genesis 1 (first), Genesis 50 (last), Philemon 1 (single-chapter, index-only previous, no next), 1 Samuel 1 (numeric title). [book.njk](_input/_layouts/book.njk) was not touched and its counts/ordering are unaffected.
- [x] Added `gap` and `flex-wrap: wrap` to the shared `nav.navigation ul` rule in [styles.css](_input/css/styles.css), covering `.chapter-navigation` on narrow screens.

## Section Links

- [x] The two "Prohibition against Spiritists and Mediums" headings in [Leviticus 20](_input/books/03-leviticus/20.md) now have distinct suffixes and generate distinct IDs.
- [ ] Resolve the remaining duplicate heading ID in [Leviticus 20](_input/books/03-leviticus/20.md): "Exhortation to Holiness and Obedience" still occurs twice and produces `exhortation-to-holiness-and-obedience` twice.
- [ ] Make generated section IDs unique within each page in [addH2Ids](.eleventy.js), and make [chapter.njk](_input/_layouts/chapter.njk) use those same IDs for section links.
- [ ] Verify that every section-navigation link reaches its intended heading, not just an existing fragment target.

## Topics And Metadata

- [x] Chose the human-readable reference format (`"<Book Title> <chapter>:<verse>"`, e.g. "2 Timothy 2:25") and rewrote [legend.txt](_input/legend.txt) to match it, dropping the old folder-path example. Topics now live as YAML-frontmatter Markdown files (e.g. [answer-with-gentleness.md](_input/topics/answer-with-gentleness.md)), not raw `.yaml` (11ty never rendered `.yaml` - see [books.js](_input/_data/books.js) and [verseRefs.js](lib/verseRefs.js)).
- [x] Verse range parsing (`start-end`, hyphen or en dash) and chapter-URL resolution are handled in [lib/verseRefs.js](lib/verseRefs.js), which resolves against the real chapter page object rather than constructing a URL string - so it's correct regardless of a book's chapter-filename zero-padding (Genesis `01.md` vs. Psalms `001.md`).
- [x] Implemented topic pages (`/topics/<slug>/`, `/topics/`) and bidirectional chapter/topic links: each topic page links out to every chapter/verse it touches ([topic.njk](_input/_layouts/topic.njk)), and every chapter shows a computed "Topics in this chapter" block linking back to its topics and to the other chapters sharing them ([chapter-topics.njk](_input/_includes/chapter-topics.njk), the `chapterTopics` collection in [.eleventy.js](.eleventy.js)). Back-links are computed at build time, never hand-maintained on the chapter side.
- [ ] Decide whether Genesis-only `bookInfo` metadata in [01-genesis.json](_input/books/01-genesis/01-genesis.json) is an experimental addition or a schema to apply to every book.

## Automated Validation And Documentation

- [ ] Replace the failing placeholder test command in [package.json](package.json) with automated content and navigation checks.
- [ ] Validate chapter filenames, titles, book metadata, expected chapter counts, and exactly one final newline per chapter file.
- [ ] Detect verse labels wrapped in anchors without a target, duplicate `id` and `name` targets, missing link destinations, and incorrect previous/next order. Do not require contiguous verse numbers or require every reference to match the enclosing chapter number.
- [ ] Add regression coverage for numeric book titles, repeated headings, first/last chapters, and single-chapter books.
- [ ] Expand [readme.md](readme.md) with install/build commands, the content schema, anchor markup, topic-reference format, and the validation workflow.
- [ ] Archive or update [wrong-titles.md](wrong-titles.md): it still describes the 33 corrected titles as current defects.
- [ ] Rerun the build and content/link checks after fixes. Current baseline: 73 chapter-navigation mismatches, one duplicated heading ID, one duplicated verse name, and one verse anchor without a name. No missing generated link destinations were found, but existence checks alone do not detect these semantic or uniqueness defects.
