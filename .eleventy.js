module.exports = function(eleventyConfig) {
  // Static assets
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Filters
  eleventyConfig.addNunjucksFilter("date", (value, format) => {
    const d = value === "now" ? new Date() : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    if (format === "yyyy") return String(d.getFullYear());
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d);
  });

  eleventyConfig.addNunjucksFilter("slug", (str = "") =>
    String(str)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  // Lighter server options (Eleventy Dev Server)
  eleventyConfig.setServerOptions({
    port: 8080,
    showAllHosts: false,
    domDiff: false,        // lighter reload
    liveReload: true,
    // no automatic open, no verbose logging
  });

  // Ignore noisy paths for the watcher
  eleventyConfig.watchIgnores.add("_site/**");
  eleventyConfig.watchIgnores.add("node_modules/**");
  eleventyConfig.watchIgnores.add(".git/**");

  return {
    dir: { input: "src", includes: "_includes", layouts: "layouts", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
