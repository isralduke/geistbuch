# TODO List

Findings from the repository analysis on 2026-10-02. These are review tasks,
not a record of completed fixes. Preserve existing chapter-title corrections.

## Content Accuracy

- [ ] Compare [1 Kings 5](_input/books/11-kings-1/05.md) with the source translation: its title and filename indicate chapter 5, but its text is numbered 6:1-6:38. Establish where chapters 5 and 6 belong before moving text or changing titles.
- [ ] Verify the corrected titles in 1 Kings 6-22 and 1 Chronicles 14-29 against the actual chapter text, not just filenames. Reconcile [wrong-titles.md](wrong-titles.md) with the current files; do not treat it as an up-to-date list of unresolved defects.
- [ ] Audit all books for missing, duplicated, or misplaced verses against the source translation. Having 66 books and 1,189 chapter files does not prove content completeness.

## Missing Verse Anchors

These ten files contain no `<a name="chapter:verse">` anchors. Check their verse
numbers and content placement first, then add consistent, unique fragment targets
and verify that direct verse links land on the intended text.

- [ ] [1 Kings 5](_input/books/11-kings-1/05.md)
- [ ] [Isaiah 41](_input/books/23-isaiah/41.md)
- [ ] [Isaiah 42](_input/books/23-isaiah/42.md)
- [ ] [Micah 1](_input/books/33-micah/01.md)
- [ ] [Micah 2](_input/books/33-micah/02.md)
- [ ] [Micah 3](_input/books/33-micah/03.md)
- [ ] [Micah 4](_input/books/33-micah/04.md)
- [ ] [Micah 5](_input/books/33-micah/05.md)
- [ ] [Micah 6](_input/books/33-micah/06.md)
- [ ] [Micah 7](_input/books/33-micah/07.md)

## Verse Numbering And Duplicate Anchors

Mixed chapter numbers may be intentional alternate versification or chapter-boundary
placement. Compare these passages with the source translation before renumbering
or relocating anything.

- [ ] [Exodus 8](_input/books/02-exodus/08.md): anchors include chapters 7 and 8.
- [ ] [Deuteronomy 13](_input/books/05-deuteronomy/13.md): anchors include chapters 12 and 13; `13:1` occurs twice. Give alternate numbering an unambiguous target distinct from the primary verse anchor.
- [ ] [Deuteronomy 22](_input/books/05-deuteronomy/22.md): anchors include chapters 22 and 23.
- [ ] [Deuteronomy 29](_input/books/05-deuteronomy/29.md): anchors include chapters 28 and 29.
- [ ] [1 Kings 4](_input/books/11-kings-1/04.md): anchors include chapters 4 and 5; review alongside the chapter 5 content-placement problem.
- [ ] [Job 31](_input/books/18-job/31.md): anchors include chapters 31 and 32.
- [ ] [Job 37](_input/books/18-job/37.md): anchors include chapters 37 and 38.
- [ ] [Job 41](_input/books/18-job/41.md): anchors include chapters 40 and 41.
- [ ] [Isaiah 64](_input/books/23-isaiah/64.md): anchors include chapters 63 and 64.
- [ ] [John 8](_input/books/43-john/08.md): anchors include chapters 7 and 8.
- [ ] Document the canonical verse-numbering scheme, how alternate numbering is represented, and whether verse targets use `id`, `name`, or both.

## Chapter Navigation

- [ ] Exclude book index pages from the chapter collection in [chapter-navigation.njk](_input/_includes/chapter-navigation.njk). Genesis 1 currently renders a previous link labeled "Chapter Genesis" pointing to its book index.
- [ ] Check numeric book titles such as "2 Samuel": [sortByChapter](.eleventy.js) parses their leading number, allowing an index page to interrupt chapter order.
- [ ] Verify previous/next links across all books against numeric chapter filename order. The analysis found 73 chapter pages that differed from this expected sequence.
- [ ] Decide whether the first chapter should have no previous link or an explicitly labeled book-index link; never label a book index as a chapter.
- [ ] Verify first/last chapters and single-chapter books, plus book-index chapter counts and ordering in [book.njk](_input/_layouts/book.njk).
- [ ] Check chapter navigation spacing and wrapping on narrow screens in [styles.css](_input/css/styles.css); its flex list currently has no gap or wrapping rule.

## Section Links

- [ ] Resolve duplicate heading IDs in [Leviticus 20](_input/books/03-leviticus/20.md). "Exhortation to Holiness and Obedience" and "Prohibition against Spiritists and Mediums" each occur twice.
- [ ] Make generated section IDs unique within each page in [addH2Ids](.eleventy.js), and make [chapter.njk](_input/_layouts/chapter.njk) use those same IDs for section links.
- [ ] Verify that every section-navigation link reaches its intended heading, not just an existing fragment target.

## Topics And Metadata

- [ ] Choose a topic-reference format and reconcile [legend.txt](_input/legend.txt) with [answer-with-gentleness.yaml](_input/topics/answer-with-gentleness.yaml): the legend describes folder-based references, while the YAML uses human-readable book names and verse ranges.
- [ ] Define topic range parsing and zero-padded chapter URL handling. The legend's `/2/` example does not match the current `/02/` chapter URLs.
- [ ] Implement topic pages and verse links if topics are intended to be user-facing; the current build does not render them.
- [ ] Decide whether Genesis-only `bookInfo` metadata in [01-genesis.json](_input/books/01-genesis/01-genesis.json) is an experimental addition or a schema to apply to every book.

## Automated Validation And Documentation

- [ ] Replace the failing placeholder test command in [package.json](package.json) with automated content and navigation checks.
- [ ] Validate chapter filenames, titles, book metadata, and expected chapter counts; explicitly allow documented alternate versification rather than flagging every cross-chapter reference as an error.
- [ ] Detect missing verse targets, duplicate `id` and `name` targets, missing link destinations, and incorrect previous/next order.
- [ ] Add regression coverage for numeric book titles, repeated headings, first/last chapters, and single-chapter books.
- [ ] Expand [readme.md](readme.md) with install/build commands, the content schema, verse/topic conventions, and the validation workflow.
- [ ] Run `npm run build` and the content/link checks after fixes. The analysis baseline was a successful build of 1,256 HTML pages with no missing root-relative link destinations or section-fragment targets, but with the semantic navigation and duplicate-anchor defects above.
