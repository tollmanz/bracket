// Eleventy v3 (ESM). Generates static HTML from data/ into _site/.
export default async function (eleventyConfig) {
  // Pixel-art styles are served as-is.
  eleventyConfig.addPassthroughCopy('assets');

  // Rebuild when data or shared libs change (they are outside the input dir).
  eleventyConfig.addWatchTarget('./data/');
  eleventyConfig.addWatchTarget('./lib/');

  return {
    dir: {
      input: 'src',
      output: '_site',
      data: '_data',
      includes: '_includes',
    },
    templateFormats: ['11ty.js'],
  };
}
