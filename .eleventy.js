const getBooks = require("./_input/_data/books.js");
const { resolveVerseRef } = require("./lib/verseRefs.js");

module.exports = function(eleventyConfig) {
  // Add slugify filter
  eleventyConfig.addFilter("slugify", function(value) {
    if (!value) return "";
    return value
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  });

  // Add sortByChapter filter - sorts chapters numerically by title
  eleventyConfig.addFilter("sortByChapter", function(collection) {
    if (!collection || !Array.isArray(collection)) return [];
    return collection.sort((a, b) => {
      const aNum = parseInt(a.data.title) || 0;
      const bNum = parseInt(b.data.title) || 0;
      return aNum - bNum;
    });
  });

  // Add findIndex filter - finds the index of a page in a collection by URL
  eleventyConfig.addFilter("findIndex", function(collection, url) {
    return collection.findIndex(item => item.url === url);
  });

  // Excludes a book's own index page (layout book.njk) from its chapter
  // collection. Must run BEFORE sortByChapter - a book index's title (e.g.
  // "Genesis", "1 Samuel") is not a chapter number and can collide with or
  // precede real chapter numbers once parsed, corrupting the sort.
  eleventyConfig.addFilter("onlyChapters", function(collection) {
    if (!collection || !Array.isArray(collection)) return [];
    return collection.filter(item => item.data.layout !== "book.njk");
  });

  // Finds a book's own index page (layout book.njk) within its tag collection.
  eleventyConfig.addFilter("findBookIndex", function(collection) {
    if (!collection || !Array.isArray(collection)) return null;
    return collection.find(item => item.data.layout === "book.njk") || null;
  });

  // Resolves a human-readable verse reference (e.g. "2 Timothy 2:25") from a
  // topic file into the matching chapter page and a verse-anchor URL.
  eleventyConfig.addFilter("resolveVerseRef", function(ref, books, collections) {
    return resolveVerseRef(ref, books, tag => collections[tag]);
  });

  // Removes the generated "source files" block that scripts/sync-topic-
  // source-links.js writes into a topic file's body. Those links point at
  // raw .md files in the repo (for browsing in VS Code/GitHub) which don't
  // exist in the published site, so they're stripped before rendering.
  eleventyConfig.addFilter("stripGeneratedBlock", function(html) {
    if (!html) return html;
    return html
      .replace(/<!--\s*topics:source-links:start[\s\S]*?topics:source-links:end\s*-->/, "")
      .trim();
  });

  // Add split filter - splits a string into an array
  eleventyConfig.addFilter("split", function(value, separator) {
    if (!value) return [];
    return value.toString().split(separator || ',');
  });

  // Extract h2 headings from HTML content
  eleventyConfig.addFilter("extractH2s", function(content) {
    if (!content) return [];
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    const matches = [];
    let match;
    while ((match = h2Regex.exec(content)) !== null) {
      matches.push(match[1].replace(/<[^>]*>/g, '').trim());
    }
    return matches;
  });

  // Add IDs to h2 headings in content
  eleventyConfig.addFilter("addH2Ids", function(content) {
    if (!content) return content;
    return content.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, function(match, attrs, text) {
      const plainText = text.replace(/<[^>]*>/g, '').trim();
      const id = plainText.toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
      // Only add ID if not already present
      if (attrs.includes('id=')) {
        return match;
      }
      return `<h2${attrs} id="${id}">${text}</h2>`;
    });
  });

  eleventyConfig.addPassthroughCopy("./_input/css/");

  // Reverse index: chapter URL -> topics that touch it, each with the
  // *other* chapters sharing that topic. Computed once at build time from
  // topic files' hand-authored "verses" lists - chapters never hand-maintain
  // their own back-links to topics.
  eleventyConfig.addCollection("chapterTopics", function(collectionApi) {
    const books = getBooks();
    const topics = collectionApi
      .getFilteredByTag("topic")
      .filter(topic => topic.data.layout !== "topics.njk");

    const entries = [];
    for (const topic of topics) {
      for (const ref of topic.data.verses || []) {
        let resolved;
        try {
          resolved = resolveVerseRef(ref, books, tag => collectionApi.getFilteredByTag(tag));
        } catch (err) {
          throw new Error(`Topic "${topic.inputPath}": ${err.message}`);
        }
        entries.push({ topic, resolved });
      }
    }

    const byChapter = {};
    for (const entry of entries) {
      const { topic, resolved } = entry;
      const chapterUrl = resolved.chapterUrl;

      const otherChapters = entries
        .filter(e => e.topic === topic && e.resolved.chapterUrl !== chapterUrl)
        .map(e => ({ url: e.resolved.chapterUrl, label: e.resolved.label }))
        .filter((c, i, arr) => arr.findIndex(x => x.url === c.url) === i);

      if (!byChapter[chapterUrl]) byChapter[chapterUrl] = [];
      byChapter[chapterUrl].push({
        topicTitle: topic.data.title,
        topicUrl: topic.url,
        verseUrl: resolved.url,
        otherChapters,
      });
    }
    return byChapter;
  });

  return {
	dir: {
		input: "_input",
		output: "_output",
		includes: "_includes",
		layouts: "_layouts"
	}
  };
};
