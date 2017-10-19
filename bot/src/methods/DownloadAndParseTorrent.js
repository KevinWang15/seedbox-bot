import fs from "fs";
import uuid from "uuid/v1";
import { httpRequest } from "../components/Http";
async function DownloadAndParseTorrent(url) {
  if (!fs.existsSync('./torrents')) {
    fs.mkdirSync('./torrents');
  }
  const torrentPath = `./torrents/${uuid()}.torrent`;
  const body = await httpRequest({
    url,
    encoding: null,
  });
  let wstream = fs.createWriteStream(torrentPath);
  wstream.write(body);
  wstream.end();
}

export { DownloadAndParseTorrent };