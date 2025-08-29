module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/scripts": "scripts" });
  eleventyConfig.addPassthroughCopy({ "src/css": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/TGK-assets": "TGK-assets" });

  return {
    dir: {
      input: "src",
      includes: "_includes",   // <-- default, matches the folder we just used
      layouts: "layouts",
      output: "_site"
    }
  };
};
