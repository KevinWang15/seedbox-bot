import { FreeUpSpace } from "./FreeUpSpace";
import { CheckIfHasSpace } from "./CheckIfHasSpace";
import { status as RssFeedTorrentStatus } from "../models/RssFeedTorrent";
import { readCoreSettings } from "../utils/coreSettings";
import logger from '../logger'
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
          logger.warn("ERR-retryFailedTorrent: " + ex.toString());
        }
      }, coreSettings.retryFailedTorrentsAfter * 1000);
    }
  }

  let spaceData = await CheckIfHasSpace(client, torrentData.length / 1024 / 1024 / 1024);
  // console.log("> Space data:", spaceData);
  if (spaceData.hasSpace) {
    logger.info("adding torrent: " + rssFeedTorrent.url);
    let result = await client.addTorrent(rssFeedTorrent.url);
    if (!result.error) {
      logger.info("> Successful: " + rssFeedTorrent.url);
      rssFeedTorrent.update({
        status: RssFeedTorrentStatus.ADDED,
        file_size_kb: torrentData.length / 1024,
      });
    } else {
      logger.warn("> Failed without reason: " + rssFeedTorrent.url);
      rssFeedTorrent.update({
        status: RssFeedTorrentStatus.ADD_FAILED,
        file_size_kb: torrentData.length / 1024,
      });
      retryFailedTorrent();
    }
    return true;
  } else {
    logger.warn("not adding torrent: " + rssFeedTorrent.url + " as there is no space left");
    if (isSecondTry || !spaceData.spaceToFreeUp /* fetch torrents list failed */) {
      rssFeedTorrent.update({
        status: RssFeedTorrentStatus.ADD_FAILED,
        file_size_kb: torrentData.length / 1024,
      });
      retryFailedTorrent();
      return false;
    } else {
      logger.info("> Not enough space, calling FreeUpSpace");
      let freeUpSpaceResult = await FreeUpSpace(client, spaceData.filesList, spaceData.spaceToFreeUp);
      if (freeUpSpaceResult) {
        logger.info("> FreeUpSpace finished, giving it a second try");
        return await AddTorrent(client, rssFeedTorrent, torrentData, true);
      } else {
        logger.info("> FreeUpSpace failed");
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