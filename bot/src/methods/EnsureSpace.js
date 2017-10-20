import { httpRequest } from "../components/Http";
import request from "request";
import urlJoin from "url-join";

const qbCookies = {};

//TODO: 如果不可能释放足够的空间，则返回false
async function EnsureSpace(boxConfig) {
  let result = await httpRequest({
    jar: qbCookies[boxConfig.url],
    url: urlJoin(boxConfig.url, '/query/torrents'),
    form: {},
    auth: { username: boxConfig.username, password: boxConfig.password },
    method: "POST",
  });
  if (!result.error) {
    let items = JSON.parse(result.body);
    let totalTorrentSize = items.map(_ => _.size).reduce((a, b) => (a + b), 0) / 1024 / 1024 / 1024;
    console.log("totalTorrentSize", totalTorrentSize);
  } else {
    console.error("/query/torrents failed, box id " + boxConfig.id);
    return false;
  }
  return true;
}

export { EnsureSpace };