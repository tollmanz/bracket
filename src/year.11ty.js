import { page, renderYear, yearMarquee } from '../lib/render.mjs';

// One static page per season at /<year>/.
export default class {
  data() {
    return {
      pagination: { data: 'bracket.years', size: 1, alias: 'year' },
      permalink: (data) => `/${data.year.year}/`,
    };
  }

  render({ bracket, year }) {
    return page({
      heading: `BRACKET ${year.year}`,
      subtitle: "STANLEY CUP PICK 'EM",
      active: year.year,
      bracket,
      body: renderYear(year, bracket),
      marquee: yearMarquee(year, bracket),
    });
  }
}
