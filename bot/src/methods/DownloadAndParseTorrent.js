import fs from "fs";
import uuid from "uuid/v1";
import parseTorrent from "parse-torrent";

import { httpRequest } from "../components/Http";
import { parseSize } from "../utils/parseSize";
function DownloadAndParseTorrent(torrent) {
  let { url, title } = torrent;

  // 尝试从标题中得到种子的大小
  let match = /(\d+\.\d{1,2}\s?[GMK]B)/im.exec(title);
  if (match)
    return Promise.resolve({ length: parseSize(match[1]) * 1024 * 1024 });

  if (!fs.existsSync('./torrents')) {
    fs.mkdirSync('./torrents');
  }
  const torrentPath = `./torrents/${uuid()}.torrent`;

  return new Promise((res, rej) => {
    httpRequest({
      url,
      encoding: null,
    }).then(r => {
      const body = r.body;
      let wstream = fs.createWriteStream(torrentPath);
      wstream.write(body);
      wstream.end();
      wstream.on('finish', () => {
        try {
          let length = parseTorrent(fs.readFileSync(torrentPath)).length;
          res({ length });
        } catch (exception) {
          rej(exception);
        } finally {
          fs.unlink(torrentPath);
        }
      });
    }).catch(rej);
  });
}
export { DownloadAndParseTorrent };