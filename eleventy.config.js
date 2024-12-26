// https://github.com/kentaroi/eleventy-sass
const eleventySass = require("eleventy-sass");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
// Include the luxon plugin
// Thanks to Stephanie Eckles https://11ty.rocks/eleventyjs/dates/
const { DateTime } = require('luxon');
https://github.com/TigersWay/eleventy-plugin-ancestry#readme
const pluginAncestry = require("@tigersway/eleventy-plugin-ancestry");

module.exports = function(eleventyConfig){
	eleventyConfig.addPlugin(eleventySass);
	eleventyConfig.addPlugin(eleventyNavigationPlugin);
	// copy images, scripts, styles to _site
	// eleventyConfig.addPassthroughCopy("_input/styles");
	eleventyConfig.addPassthroughCopy("src/images");
	eleventyConfig.addPassthroughCopy("src/js");
	eleventyConfig.addPassthroughCopy("src/.htaccess");
	eleventyConfig.addFilter('readableDate', (dateObj) => {
		return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
			'dd LLL yyyy'
		);
	});
	eleventyConfig.addPlugin(pluginAncestry);
	// set input and output directories
	return {
		dir: {
			input : "_input",
			output: "_output",
			layouts: "_layouts"
		}
	};
	// https://github.com/orchidjs/eleventy-plugin-ids
	const anchors_plugin = require('@orchidjs/eleventy-plugin-ids');
	eleventyConfig.addPlugin(anchors_plugin,{
		selectors: ['h1','h2','h3','h4','h5','h6']
	});
};
