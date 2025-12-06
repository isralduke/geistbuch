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

  return {
	dir: {
		input: "_input",
		output: "_output",
		includes: "_includes",
		layouts: "_layouts"
	}
  };
};
