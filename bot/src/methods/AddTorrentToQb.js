import urlJoin from "url-join";
import { httpRequest } from "../components/Http";
import { CheckIfHasSpace, FreeUpSpace } from "./FreeUpSpace";
import { cookieJars } from "../mem/CookieJars";
import { LoginQb } from "./LoginQb";
import { status as RssFeedTorrentStatus } from "../models/RssFeedTorrent";

//TODO: loginQb 加锁
//TODO: safe_add 流程，也需要加锁


async function AddTorrentToQb(boxConfig, rssFeedTorrent, torrentData, isSecondTry = false) {
  console.log("AddTorrentToQb");
  if (!cookieJars[boxConfig.url]) {
    await LoginQb(boxConfig);
  }
  let spaceData = await CheckIfHasSpace(boxConfig, torrentData.length / 1024 / 1024 / 1024);
  // console.log("> Space data:", spaceData);
  if (spaceData.hasSpace) {
    let result = await httpRequest({
      jar: cookieJars[boxConfig.url],
      url: urlJoin(boxConfig.url, '/command/download'),
      form: { urls: rssFeedTorrent.url },
      auth: { username: boxConfig.basic_auth_username, password: boxConfig.basic_auth_password },
      method: "POST",
    });

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
    }
  } else {
    console.log("> Failed: " + rssFeedTorrent.url);
    if (isSecondTry) {
      rssFeedTorrent.update({
        status: RssFeedTorrentStatus.ADD_FAILED,
        file_size_kb: torrentData.length / 1024,
      });
      return false;
    } else {
      console.log("> Not enough space, calling FreeUpSpace");
      await FreeUpSpace(boxConfig, spaceData.autoDelConfig, spaceData.filesList, spaceData.spaceToFreeUp);
      console.log("> FreeUpSpace finished, giving it a second try");
      AddTorrentToQb(boxConfig, rssFeedTorrent, torrentData, true);
    }
  }
}


export { AddTorrentToQb };