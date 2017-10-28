import { system as systemConfig } from "../config";

//TODO: 移动到单独文件里

async function FreeUpSpace(client, autoDelConfig, filesList, spaceToFreeUp) {
  let torrentsToDelete = [], spaceFreedUp = 0; // 单位均为GB

  function setTorrentToDelete(item) {
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
    await setTorrentToDelete(filesList.shift());
  }

  //4. 发送删除请求
  let result = await client.deleteTorrents(torrentsToDelete);

  //5. 判断是否删除成功
  return !result.error && spaceFreedUp >= spaceToFreeUp;
}

export { FreeUpSpace };