import urlJoin from "url-join";
import { httpRequest } from "../components/Http";
import { CheckIfHasSpace, FreeUpSpace } from "./FreeUpSpace";
import { cookieJars } from "../mem/CookieJars";
import { LoginQb } from "./LoginQb";
import { status as RssFeedTorrentStatus } from "../models/RssFeedTorrent";

//TODO: loginQb 加锁
//TODO: safe_add 流程，也需要加锁


async function AddTorrentToQb(boxConfig, rssFeedTorrent, torrentData) {
  if (!cookieJars[boxConfig.url]) {
    await LoginQb(boxConfig);
  }

  let spaceData = await CheckIfHasSpace(boxConfig);

  if (spaceData.hasSpace) {
    let result = await httpRequest({
      jar: cookieJars[boxConfig.url],
      url: urlJoin(boxConfig.url, '/command/download'),
      form: { urls: rssFeedTorrent.url },
      auth: { username: boxConfig.basic_auth_username, password: boxConfig.basic_auth_password },
      method: "POST",
    });

    if (!result.error) {
      rssFeedTorrent.update({
        status: RssFeedTorrentStatus.ADDED,
        file_size_kb: torrentData.length / 1024,
      });
    } else {
      rssFeedTorrent.update({
        status: RssFeedTorrentStatus.ADD_FAILED,
        file_size_kb: torrentData.length / 1024,
      });
    }
  } else {
    await FreeUpSpace(boxConfig, spaceData.autoDelConfig, spaceData.filesList, spaceData.spaceToFreeUp);
    // Set to add_failed and TODO: retry in next iteration
    rssFeedTorrent.update({
      status: RssFeedTorrentStatus.ADD_FAILED,
      file_size_kb: torrentData.length / 1024,
    });
    return false;
  }
}


export { AddTorrentToQb };