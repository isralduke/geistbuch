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

  return {
	dir: {
		input: "_input",
		output: "_output",
		includes: "_includes",
		layouts: "_layouts"
	}
  };
};
