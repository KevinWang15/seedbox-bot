import { httpRequest } from "../components/Http";
import { AutoDelConfig } from "../models/AutoDelConfig";
import { system as systemConfig } from "../config";
import urlJoin from "url-join";
import { cookieJars } from '../mem/CookieJars';
import { LoginQb } from "./LoginQb";

async function FreeUpSpace(boxConfig, spaceToFreeUpGB) {
  let maxAllowedUsage, totalFilesSize; // 单位均为GB

  let autoDelConfig = await AutoDelConfig.find({
    where: {
      user_id: boxConfig.user_id,
    },
  });

  if (!autoDelConfig)
    return true;

  if (!cookieJars[boxConfig.url]) {
    await LoginQb(boxConfig);
  }
  
  maxAllowedUsage = autoDelConfig.max_disk_usage_size_gb;

  let result = await httpRequest({
    jar: cookieJars[boxConfig.url],
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
      return await freeUpSpace(boxConfig, autoDelConfig, items, spaceToFreeUp);
    } else {
      return true;
    }
  } else {
    console.error("/query/torrents failed, box id " + boxConfig.id);
    return false;
  }
}

async function freeUpSpace(boxConfig, autoDelConfig, filesList, spaceToFreeUp) {
  let torrentsToDelete = [], spaceFreedUp = 0; // 单位均为GB

  function deleteTorrent(item) {
    spaceFreedUp += item.size / 1024 / 1024 / 1024;
    torrentsToDelete.push(item);
  }

  function isTorrentExempt(item) {
    if (item.dlspeed)
      return true;

    if ((item.added_on + systemConfig.newTorrentsTTL) > (+new Date()) / 1000)
      return true;

    if (autoDelConfig.exempt_label && item.category === autoDelConfig.exempt_label)
      return true;

    return false;
  }

  //1. 排除种子：排除正在下载的种子
  filesList = filesList.filter(_ => !isTorrentExempt(_));

  //2. 根据upspeed和时间排序，删除速度最慢又最旧的种子
  filesList.sort((a, b) => {
    if (a.upspeed !== b.upspeed) {
      return a.upspeed - b.upspeed;
    } else {
      return a.added_on - b.added_on;
    }
  });

  //3. 从头开始尝试删除
  while (spaceFreedUp < spaceToFreeUp && filesList.length) {
    await deleteTorrent(filesList.shift());
  }

  //4. 发送删除请求
  let result = await httpRequest({
    jar: cookieJars [boxConfig.url],
    url: urlJoin(boxConfig.url, '/command/deletePerm'),
    form: { hashes: torrentsToDelete.map(_ => _.hash).join('|') },
    auth: { username: boxConfig.username, password: boxConfig.password },
    method: "POST",
  });

  //5. 判断是否删除成功
  return !result.error && spaceFreedUp >= spaceToFreeUp;
}

export { FreeUpSpace };