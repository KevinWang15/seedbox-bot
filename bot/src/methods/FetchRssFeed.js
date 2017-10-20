import { httpRequest } from "../components/Http";
import et from "elementtree";

async function FetchRssFeed(rssFeed) {
  let rss = (await httpRequest({
    url: rssFeed.url,
    method: "GET",
  })).body;

  let rssRoot = et.parse(rss);
  let torrents = rssRoot.findall('./channel/item');
  let results = [];
  for (let i = 0; i < torrents.length; i++) {
    let title = torrents[i].find('./title').text;
    let url = torrents[i].find('./enclosure').attrib.url;
    let pubDate = torrents[i].find('./pubDate').text;
    results.push({ title, url, pubDate, rss_feed_id: rssFeed.id });
  }
  return {
    ...rssFeed.dataValues,
    torrents: results,
  };
}

export { FetchRssFeed };