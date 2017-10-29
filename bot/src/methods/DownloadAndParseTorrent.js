import fs from "fs";
import uuid from "uuid/v1";
import parseTorrent from "parse-torrent";

import { httpRequest } from "../components/Http";
function DownloadAndParseTorrent(url) {
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
          res({ length, path: torrentPath });
        } catch (exception) {
          rej(exception);
        }
      });
    }).catch(rej);
  });
}
export { DownloadAndParseTorrent };