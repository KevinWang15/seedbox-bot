import { httpRequest } from "../components/Http";
import { AutoDelConfig } from "../models/AutoDelConfig";
import request from "request";
import urlJoin from "url-join";

const qbCookies = {};

//TODO: 如果不可能释放足够的空间，则返回false
async function EnsureSpace(boxConfig, spaceToFreeUpGB) {
  let maxAllowedUsage, totalFilesSize; // 单位均为GB

  let autoDelConfig = await AutoDelConfig.find({ user_id: boxConfig.user_id });
  if (!autoDelConfig)
    return true;

  maxAllowedUsage = autoDelConfig.max_disk_usage_size_gb;

  let result = await httpRequest({
    jar: qbCookies[boxConfig.url],
    url: urlJoin(boxConfig.url, '/query/torrents'),
    form: {},
    auth: { username: boxConfig.username, password: boxConfig.password },
    method: "POST",
  });
  if (!result.error) {
    let items = JSON.parse(result.body);
    totalFilesSize = items.map(_ => _.size).reduce((a, b) => (a + b), 0) / 1024 / 1024 / 1024;
    if (totalFilesSize + spaceToFreeUpGB > maxAllowedUsage) {
      let spaceToFreeUp = totalFilesSize + spaceToFreeUpGB - maxAllowedUsage;
      return await freeUpSpace(boxConfig, items, spaceToFreeUp);
    } else {
      return true;
    }
  } else {
    console.error("/query/torrents failed, box id " + boxConfig.id);
    return false;
  }
}

async function freeUpSpace(boxConfig, filesList, spaceToFreeUp) {

}

export { EnsureSpace };