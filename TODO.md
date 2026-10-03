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

- [ ] Exclude book index pages from the chapter collection in [chapter-navigation.njk](_input/_includes/chapter-navigation.njk). Genesis 1 currently renders a previous link labeled "Chapter Genesis" pointing to its book index.
- [ ] Check numeric book titles such as "2 Samuel": [sortByChapter](.eleventy.js) parses their leading number, allowing an index page to interrupt chapter order.
- [ ] Verify previous/next links across all books against numeric chapter filename order. The analysis found 73 chapter pages that differed from this expected sequence.
- [ ] Decide whether the first chapter should have no previous link or an explicitly labeled book-index link; never label a book index as a chapter.
- [ ] Add regression checks for first/last chapters and single-chapter books. Preserve the currently passing book-index counts and ordering in [book.njk](_input/_layouts/book.njk).
- [ ] Check chapter navigation spacing and wrapping on narrow screens in [styles.css](_input/css/styles.css); its flex list currently has no gap or wrapping rule.

## Section Links

- [x] The two "Prohibition against Spiritists and Mediums" headings in [Leviticus 20](_input/books/03-leviticus/20.md) now have distinct suffixes and generate distinct IDs.
- [ ] Resolve the remaining duplicate heading ID in [Leviticus 20](_input/books/03-leviticus/20.md): "Exhortation to Holiness and Obedience" still occurs twice and produces `exhortation-to-holiness-and-obedience` twice.
- [ ] Make generated section IDs unique within each page in [addH2Ids](.eleventy.js), and make [chapter.njk](_input/_layouts/chapter.njk) use those same IDs for section links.
- [ ] Verify that every section-navigation link reaches its intended heading, not just an existing fragment target.

## Topics And Metadata

- [ ] Choose a topic-reference format and reconcile [legend.txt](_input/legend.txt) with [answer-with-gentleness.yaml](_input/topics/answer-with-gentleness.yaml): the legend describes folder-based references, while the YAML uses human-readable book names and verse ranges.
- [ ] Define topic range parsing and zero-padded chapter URL handling. The legend's `/2/` example does not match the current `/02/` chapter URLs.
- [ ] Implement topic pages and verse links if topics are intended to be user-facing; the current build does not render them.
- [ ] Decide whether Genesis-only `bookInfo` metadata in [01-genesis.json](_input/books/01-genesis/01-genesis.json) is an experimental addition or a schema to apply to every book.

## Automated Validation And Documentation

- [ ] Replace the failing placeholder test command in [package.json](package.json) with automated content and navigation checks.
- [ ] Validate chapter filenames, titles, book metadata, expected chapter counts, and exactly one final newline per chapter file.
- [ ] Detect verse labels wrapped in anchors without a target, duplicate `id` and `name` targets, missing link destinations, and incorrect previous/next order. Do not require contiguous verse numbers or require every reference to match the enclosing chapter number.
- [ ] Add regression coverage for numeric book titles, repeated headings, first/last chapters, and single-chapter books.
- [ ] Expand [readme.md](readme.md) with install/build commands, the content schema, anchor markup, topic-reference format, and the validation workflow.
- [ ] Archive or update [wrong-titles.md](wrong-titles.md): it still describes the 33 corrected titles as current defects.
- [ ] Rerun the build and content/link checks after fixes. Current baseline: 73 chapter-navigation mismatches, one duplicated heading ID, one duplicated verse name, and one verse anchor without a name. No missing generated link destinations were found, but existence checks alone do not detect these semantic or uniqueness defects.
