import { FreeUpSpace } from "./FreeUpSpace";
import { CheckIfHasSpace } from "./CheckIfHasSpace";
import { status as RssFeedTorrentStatus } from "../models/RssFeedTorrent";
import { readCoreSettings } from "../utils/coreSettings";
let coreSettings = readCoreSettings();

//TODO: loginQb 加锁
//TODO: safe_add 流程，也需要加锁


async function AddTorrent(client, rssFeedTorrent, torrentData, isSecondTry = false) {
  function retryFailedTorrent() {
    if (coreSettings.retryFailedTorrentsAfter) {
      setTimeout(async () => {
        try {
          await rssFeedTorrent.destroy();
        } catch (ex) {
          console.log("ERR-retryFailedTorrent: " + ex.toString());
        }
      }, coreSettings.retryFailedTorrentsAfter * 1000);
    }
  }

  let spaceData = await CheckIfHasSpace(client, torrentData.length / 1024 / 1024 / 1024);
  // console.log("> Space data:", spaceData);
  if (spaceData.hasSpace) {
    console.log("adding torrent: " + rssFeedTorrent.url);
    let result = await client.addTorrent(rssFeedTorrent.url);
    if (!result.error) {
      console.log("> Successful: " + rssFeedTorrent.url);
      rssFeedTorrent.update({
        status: RssFeedTorrentStatus.ADDED,
        file_size_kb: torrentData.length / 1024,
      });
    } else {
      console.log("> Failed without reason: " + rssFeedTorrent.url);
      rssFeedTorrent.update({
        status: RssFeedTorrentStatus.ADD_FAILED,
        file_size_kb: torrentData.length / 1024,
      });
      retryFailedTorrent();
    }
    return true;
  } else {
    console.log("not adding torrent: " + rssFeedTorrent.url + " as there is no space left");
    if (isSecondTry || !spaceData.spaceToFreeUp /* fetch torrents list failed */) {
      rssFeedTorrent.update({
        status: RssFeedTorrentStatus.ADD_FAILED,
        file_size_kb: torrentData.length / 1024,
      });
      retryFailedTorrent();
      return false;
    } else {
      console.log("> Not enough space, calling FreeUpSpace");
      let freeUpSpaceResult = await FreeUpSpace(client, spaceData.filesList, spaceData.spaceToFreeUp);
      if (freeUpSpaceResult) {
        console.log("> FreeUpSpace finished, giving it a second try");
        return await AddTorrent(client, rssFeedTorrent, torrentData, true);
      } else {
        console.log("> FreeUpSpace failed");
        rssFeedTorrent.update({
          status: RssFeedTorrentStatus.ADD_FAILED,
          file_size_kb: torrentData.length / 1024,
        });
        retryFailedTorrent();
        return false;
      }
    }
  }
}


export { AddTorrent };