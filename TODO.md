# TODO List

## Critical Issues

- [ ] All layout and include files are empty - need to be populated
- [ ] CSS directory is empty - no styling
- [ ] Chapter markdown files lack `layout` property in frontmatter
- [ ] Missing JSON metadata files for books 2-66
- [ ] No `.eleventy.js` configuration for passthrough copy, filters, or other features

## What Needs to Be Done

- [ ] Populate layout files with proper Nunjucks templates
  - `_input/_layouts/_base.njk`
  - `_input/_layouts/chapter.njk`
  - `_input/_layouts/book.njk`
- [ ] Populate include files with reusable components
  - `_input/_includes/breadcrumbs.njk`
  - `_input/_includes/chapter-navigation.njk`
- [ ] Create CSS stylesheet for styling
  - `_input/css/style.css`
- [ ] Add `layout: chapter.njk` to all 1,185 chapter frontmatter blocks
- [ ] Create JSON metadata files for all 66 books
- [ ] Enhance `.eleventy.js` with:
  - Filters for navigation and sorting
  - Passthrough copy for CSS
  - Template engine configuration
- [ ] Create book index pages (`index.md`) for all 66 books
- [ ] Populate home page (`_input/index.md`) with book listings
