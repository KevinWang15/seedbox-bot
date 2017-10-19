import fs from "fs";
import uuid from "uuid/v1";
import parseTorrent from "parse-torrent";

import { httpRequest } from "../components/Http";
function DownloadAndParseTorrent(url) {
  if (!fs.existsSync('./torrents')) {
    fs.mkdirSync('./torrents');
  }
  const torrentPath = `./torrents/${uuid()}.torrent`;

  return new Promise(res => {
    httpRequest({
      url,
      encoding: null,
    }).then(body => {
      let wstream = fs.createWriteStream(torrentPath);
      wstream.write(body);
      wstream.end();
      wstream.on('finish', () => {
        let length = parseTorrent(fs.readFileSync(torrentPath)).length;
        res({ length, path: torrentPath });
      });
    });
  });
}

export { DownloadAndParseTorrent };