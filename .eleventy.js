module.exports = function(eleventyConfig) {
  // pass-through assets used in pages
  eleventyConfig.addPassthroughCopy({ "src/scripts": "scripts" });
  eleventyConfig.addPassthroughCopy({ "src/css": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/TGK-assets": "TGK-assets" });

  // If/when you move your TGK CSS out of _site, enable this and create the folder:
  // eleventyConfig.addPassthroughCopy({ "src/css/TGK-main-styles": "css/TGK-main-styles" });

  return {
    dir: {
      input: "src",
      includes: "partials",
      layouts: "layouts",
      output: "_site"
    }
  };
};
