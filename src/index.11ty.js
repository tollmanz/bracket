import { page, renderLeaderboard, leaderboardMarquee } from '../lib/render.mjs';

// All-time leaderboard at the site root.
export default class {
  data() {
    return { permalink: '/' };
  }

  render({ bracket }) {
    return page({
      heading: 'BRACKET',
      subtitle: 'ALL-TIME LEADERBOARD',
      active: 'leaderboard',
      bracket,
      body: renderLeaderboard(bracket),
      marquee: leaderboardMarquee(bracket),
    });
  }
}
