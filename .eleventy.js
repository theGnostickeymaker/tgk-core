// .eleventy.js (CommonJS, safe default)
const { DateTime } = require("luxon");
const slugify = require("slugify");

module.exports = function(eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({
    throwOnUndefined: true,
    trimBlocks: true,
    lstripBlocks: true
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addFilter("date", (d, fmt = "dd LLL yyyy") => {
    if (!d) return "";
    // Accept JS Date or ISO string
    const jsd = d instanceof Date ? d : new Date(d);
    return DateTime.fromJSDate(jsd, { zone: "utc" }).toFormat(fmt);
  });

  eleventyConfig.addFilter("slug", s =>
    slugify(String(s ?? ""), { lower: true, strict: true })
  );

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));
  eleventyConfig.addPairedShortcode("quote", (content, author = "") => {
    const cite = author ? `<cite>${author}</cite>` : "";
    return `<blockquote class="tgk-quote">${content}${cite}</blockquote>`;
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", layouts: "layouts" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    templateFormats: ["njk", "md"]
  };
};
